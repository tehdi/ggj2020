import React from 'react';
import './App.css';
import gameData from './gameData.js';

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
                key={firstMission.id}
                missionId={firstMission.id}
                missionActiveCard={images["missionActiveCard" + firstMission.id + ".png"]}
                missionCompleteCard={images["missionCompleteCard" + firstMission.id + ".png"]}
                onCompleteMission={this.onCompleteMission}
                afterCompleteMission={this.afterCompleteMission} />
        const secondMissionComponent =
            <Mission
                key={secondMission.id}
                missionId={secondMission.id}
                missionActiveCard={images["missionActiveCard" + secondMission.id + ".png"]}
                missionCompleteCard={images["missionCompleteCard" + secondMission.id + ".png"]}
                onCompleteMission={this.onCompleteMission}
                afterCompleteMission={this.afterCompleteMission} />
        const thirdMissionComponent =
            <Mission
                key={thirdMission.id}
                missionId={thirdMission.id}
                missionActiveCard={images["missionActiveCard" + thirdMission.id + ".png"]}
                missionCompleteCard={images["missionCompleteCard" + thirdMission.id + ".png"]}
                onCompleteMission={this.onCompleteMission}
                afterCompleteMission={this.afterCompleteMission} />

        // TODO: Rae start the "skip turn" timer here

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
                        <div className="clear">
                            <button id="noMissionButton" onClick={this.skipTurn}>None</button>
                        </div>
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
        // TODO Rae, use this to reset the "skip turn" timeout
        console.log("Mission complete!");
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

        // re-enable each element with ID "missionButtonX", in case one is the same as last round
        for (var disableId = 0; disableId < 100; disableId++) {
            if (document.getElementById("missionButton" + disableId)) {
                document.getElementById("missionButton" + disableId).disabled = false;
            }
        }
        this.setState({
            rate: newRate,
            currentScore: newScore,
            completedMissionIds: completedMissionIds,
            gameStatus: newGameStatus,
        });
    }

    skipTurn = () => {
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
    }

    getNewRate = (mission) => {
        const rateChange = mission.rateImpact;
        return this.state.rate + rateChange;
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
                <button id={"missionButton" + this.props.missionId}
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
        console.log("Completing " + this.props.missionId);

        // disable each element with ID "missionButtonX"
        for (var missionId = 0; missionId < 100; missionId++) {
            if (document.getElementById("missionButton" + missionId)) {
                document.getElementById("missionButton" + missionId).disabled = "disabled";
            }
        }

        this.props.onCompleteMission();
        this.setState({ image: this.props.missionCompleteCard });
        setTimeout(() => {
            this.props.afterCompleteMission(this.props.missionId);
        }, 3000);
    }
}

export default App;
