import React from 'react';
import './App.css';
import gameData from './gameData.js';

class App extends React.Component {

    constructor(props) {
        super(props);

        const completedMissionIds = new Set();

        this.state = {
            gameStatus: "play",
            score: gameData.startingScore,
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

        const missionComponents = availableMissions
            .map(mission => {
                return <Mission
                    key={mission.id}
                    missionId={mission.id}
                    missionActiveCard={images["missionActiveCard" + mission.id + ".png"]}
                    missionCompleteCard={images["missionCompleteCard" + mission.id + ".png"]}
                    afterCompleteMission={this.afterCompleteMission} />
            });

        return (
            <div className="App">
                <div id="play" className={this.state.gameStatus === "play" ? "" : "hidden"}>
                    <div id="stateDisplay">
                        <div>{this.state.score} / {this.state.loseScore} ({this.state.rate < 0 ? "" : "+"}{this.state.rate} / turn)</div>
                    </div>

                    <div id="missionDisplay">
                        {missionComponents}
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

    afterCompleteMission = (missionId) => {
        const completedMission = gameData.missions
            .find(mission => missionId === mission.id);

        const oldRate = this.state.rate;
        const newRate = this.getNewRate(completedMission);
        const completedMissionIds = this.state.completedMissionIds;
        completedMissionIds.add(missionId);

        const currentScore = this.state.currentScore;
        const loseScore = this.state.loseScore;
        const winScore = this.state.winScore;
        const newGameStatus = currentScore <= winScore ? "win"
            : currentScore >= loseScore ? "lose"
                : "play";
        console.log("New game status: " + newGameStatus);

        this.setState({
            rate: newRate,
            score: this.state.score + oldRate,
            completedMissionIds: completedMissionIds,
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
                <button className="missionButton" onClick={this.completeMission}>
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
        this.setState({ image: this.props.missionCompleteCard });
        setTimeout(() => {
            this.props.afterCompleteMission(this.props.missionId);
        }, 3000);
    }
}

export default App;
