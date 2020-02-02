import React from 'react';
import './App.css';
import gameData from './gameData.js';

var GAMEPAD;
var GAMEPADMAP = {
    8: 'missionButton1',
    5: 'missionButton2',
    3: 'missionButton3'
};

var round_timer = 0;
var freeze_timer = false;
var buttonsPressed = [];
var GAMEPADLOOP = {}; 
window.addEventListener("gamepadconnected", (event) => {
    GAMEPAD = event.gamepad;
    console.log("Controller Connected");
    GAMEPADLOOP = window.setInterval(function() {
            var gp = navigator.getGamepads()[0];
            for (var property in GAMEPADMAP) {
            if (GAMEPADMAP.hasOwnProperty(property)) {
              if(gp.buttons[property].pressed) {
                console.log("Button "+property+" pressed");
                  document.getElementById(GAMEPADMAP[property]).click(); 
              }
            }
        }
    }, 200);
    
  });

  
  window.addEventListener("gamepaddisconnected", (event) => {
    GAMEPAD = {};
    window.clearInterval(GAMEPADLOOP);
  });

class App extends React.Component {

    constructor(props) {
        super(props);

        const completedMissionIds = new Set();

        this.state = {
            gameStatus: "play",
            currentScore: gameData.startingScore,
            rate: gameData.startingRate,
            winScore: gameData.winScore,
            loseScore: gameData.loseScore,
            availableMissions: [],
            completedMissionIds: completedMissionIds,
        }
    }

    importAll = (r) => {
        let images = {};
        r.keys().forEach((item, index) => images[item.replace('./', '')] = r(item));
        return images;
    }

    render() {
        const images = this.importAll(require.context('./images', false, /\.png$/));
        const availableMissions = this.selectMissions(this.state.completedMissionIds);

        const firstMission = availableMissions[0];
        const secondMission = availableMissions[1];
        const thirdMission = availableMissions[2];

        const firstMissionComponent =
            <Mission
                buttonId="missionButton1"
                key={firstMission.id}
                missionId={firstMission.id}
                missionActiveCard={images["missionActiveCard" + firstMission.id + ".png"]}
                missionCompleteCard={images["missionCompleteCard" + firstMission.id + ".png"]}
                onCompleteMission={this.onCompleteMission}
                afterCompleteMission={this.afterCompleteMission} />
        const secondMissionComponent =
            <Mission
                buttonId="missionButton2"
                key={secondMission.id}
                missionId={secondMission.id}
                missionActiveCard={images["missionActiveCard" + secondMission.id + ".png"]}
                missionCompleteCard={images["missionCompleteCard" + secondMission.id + ".png"]}
                onCompleteMission={this.onCompleteMission}
                afterCompleteMission={this.afterCompleteMission} />
        const thirdMissionComponent =
            <Mission
                buttonId="missionButton3"
                key={thirdMission.id}
                missionId={thirdMission.id}
                missionActiveCard={images["missionActiveCard" + thirdMission.id + ".png"]}
                missionCompleteCard={images["missionCompleteCard" + thirdMission.id + ".png"]}
                onCompleteMission={this.onCompleteMission}
                afterCompleteMission={this.afterCompleteMission} />

        // start the "skip turn" timer here
        // if players don't complete a mission within 1 minute, they get nothing for this round
        if (this.state.gameStatus === "play") {
            this.timeout = setInterval(() => { 
                if(round_timer >= 60 && !freeze_timer) {
                    freeze_timer = true;
                    this.onSkipTurn() 
                    clearInterval(this.timeout);
                }
                else if(!freeze_timer) {
                    var turnperc = ((round_timer/60) * 100).toFixed(3);
                    var scoreperc = ((this.state.currentScore/10000) * 100).toFixed(3);
                    fetch('http://localhost:8081', {
                        method: 'POST',
                        headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            turn: turnperc, score: scoreperc
                        })
                        })
                        .catch(console.log)
                    round_timer++;
                }
                console.log("T + :"+round_timer)
            }, 1000);
        }

        return (
            <div className="App">
                <div id="play" className={this.state.gameStatus === "play" ? "" : "hidden"}>
                    <div id="stateDisplay">
                        <div>{this.state.currentScore} / {this.state.loseScore} ({this.state.rate < 0 ? "" : "+"}{this.state.rate} / turn)</div>
                    </div>

                    <div id="missionDisplay">
                        {firstMissionComponent}
                        {secondMissionComponent}
                        {thirdMissionComponent}
                    </div>
                </div>
                <div id="win" className={this.state.gameStatus === "win" ? "" : "hidden"}>
                    <span>You win!</span>
                </div>
                <div id="lose" className={this.state.gameStatus === "lose" ? "" : "hidden"}>
                    <span>You lose.</span>
                </div>
            </div>
        );
    }

    selectMissions = (completedMissionIds) => {
        // don't present an already-completed mission again
        // and at any given point, we should show three distinct ones
        const allMissionIds = gameData.missions.map(mission => mission.id);
        const selectedMissionIds = new Set();
        while (selectedMissionIds.size < 3) {
            const missionIdIndex = Math.floor(Math.random() * allMissionIds.length);
            const missionId = allMissionIds[missionIdIndex];

            if (!completedMissionIds.has(missionId)) {
                console.log("using " + missionId);
                selectedMissionIds.add(missionId);
            } else {
                console.log("ignoring " + missionId);
            }
        }

        const selectedMissions = [];
        selectedMissionIds.forEach(missionId => {
            selectedMissions.push(gameData.missions.find(mission => mission.id === missionId))
        })
        console.log(selectedMissions);
        return selectedMissions;
    }

    onCompleteMission = () => {
        document.getElementById("missionButton1").disabled = "disabled";
        document.getElementById("missionButton2").disabled = "disabled";
        document.getElementById("missionButton3").disabled = "disabled";

        // clear the "skip turn" timeout
        if (this.timeout) {
            clearInterval(this.timeout)
            round_timer = 0;
            freeze_timer = false;
            this.timeout = null
        }
    }

    afterCompleteMission = (missionId) => {
        const completedMission = gameData.missions
            .find(mission => missionId === mission.id);

        const completedMissionIds = this.state.completedMissionIds;
        completedMissionIds.add(missionId);

        const oldRate = this.state.rate;
        const newScore = this.state.currentScore + oldRate;
        const newRate = this.getNewRate(completedMission);

        const loseScore = this.state.loseScore;
        const winScore = this.state.winScore;
        const newGameStatus = newScore <= winScore ? "win"
            : newScore >= loseScore ? "lose"
                : "play";

        document.getElementById("missionButton1").disabled = false;
        document.getElementById("missionButton2").disabled = false;
        document.getElementById("missionButton3").disabled = false;

        this.setState({
            rate: newRate,
            currentScore: newScore,
            completedMissionIds: completedMissionIds,
            gameStatus: newGameStatus,
        });
    }

    onSkipTurn = () => {
        document.getElementById("missionButton1").disabled = "disabled";
        document.getElementById("missionButton2").disabled = "disabled";
        document.getElementById("missionButton3").disabled = "disabled";

        setTimeout(() => {
            this.afterSkipTurn();
        }, 3000);
    }

    afterSkipTurn = () => {
        const oldRate = this.state.rate;
        const newScore = this.state.currentScore + oldRate;

        const loseScore = this.state.loseScore;
        const winScore = this.state.winScore;
        const newGameStatus = newScore <= winScore ? "win"
            : newScore >= loseScore ? "lose"
                : "play";

        this.setState({
            currentScore: newScore,
            gameStatus: newGameStatus,
        });

        document.getElementById("missionButton1").disabled = false;
        document.getElementById("missionButton2").disabled = false;
        document.getElementById("missionButton3").disabled = false;
        round_timer = 0;
        freeze_timer = false;
    }

    getNewRate = (mission) => {
        const rateChange = mission.rateImpact;
        return this.state.rate + rateChange;
    }

    componentWillUnmount = () => {
        if (this.timeout) {
            freeze_timer = false;
            round_timer = 0;
            clearInterval(this.timeout)
        }
    }
}

class Mission extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            image: this.props.missionActiveCard,
        };
    }

    render() {
        return (
            <div className="missionBox">
                <button id={this.props.buttonId}
                    className="missionButton"
                    onClick={this.completeMission}>
                    <img id={"missionCard" + this.props.missionId}
                        className="missionCard"
                        src={this.state.image}
                        alt={"Card for mission " + this.props.missionId} />
                </button>
            </div>
        )
    }

    completeMission = () => {
        console.log("Completing " + this.props.missionId)
        this.props.onCompleteMission();
        this.setState({ image: this.props.missionCompleteCard });
        setTimeout(() => {
            this.props.afterCompleteMission(this.props.missionId);
        }, 3000);
    }
}

export default App;
