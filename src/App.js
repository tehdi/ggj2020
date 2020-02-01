import React from 'react';
import './App.css';
import gameData from './gameData.js';

class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            score: gameData.startingScore,
            rate: gameData.startingRate,
            availableMissions: this.selectMissions(),
        }
    }

    importAll = (r) => {
        let images = {};
        r.keys().forEach((item, index) => images[item.replace('./', '')] = r(item));
        return images;
    }

    render() {
        const images = this.importAll(require.context('./images', false, /\.png$/));
        const availableMissions = this.selectMissions();

        const missionComponents = availableMissions
            .map(mission => {
                return <Mission
                    key={mission.id}
                    missionId={mission.id}
                    missionDescription={mission.description}
                    missionActiveCard={images["missionActiveCard" + mission.id + ".png"]}
                    missionCompleteCard={images["missionCompleteCard" + mission.id + ".png"]}
                    onCompleteMission={this.completeMission} />
            });

        return (
            <div className="App">
                <div id="stateDisplay">
                    <div>{this.state.score} ({this.state.rate < 0 ? "" : "+"}{this.state.rate} / turn)</div>
                </div>

                <div id="missionDisplay">
                    {missionComponents}
                </div>
            </div>
        );
    }

    selectMissions = () => {
        // for now we're not worried about re-presenting the same mission multiple times
        // but at any given point, we should show three different ones
        const allMissions = gameData.missions;
        const missionIds = new Set();
        while (missionIds.size < 3) {
            missionIds.add(Math.floor(Math.random() * allMissions.length));
        }

        const selectedMissions = [];
        missionIds.forEach(missionId => {
            selectedMissions.push(allMissions[missionId]);
        })
        return selectedMissions;
    }

    completeMission = (missionId) => {
        console.log("Completing " + missionId);
        const completedMission = gameData.missions
            .find(mission => missionId === mission.id);

        this.setState({
            score: this.getNewScore(completedMission),
            rate: this.getNewRate(completedMission),
            availableMissions: this.selectMissions()
        });
    }

    getNewScore = (mission) => {
        const scoreChange = mission.scoreImpact;
        return this.state.score + scoreChange;
    }

    getNewRate = (mission) => {
        const rateChange = mission.rateImpact;
        return this.state.rate + rateChange;
    }
}

class Mission extends React.Component {
    constructor(props) {
        super(props);
        this.state = { complete: false };
    }

    completeMission = () => {
        this.setState({ complete: true });
        // this.props.onCompleteMission(this.props.missionId);
    }

    render() {
        return (
            <div className="missionBox">
                <div>Mission {this.props.missionId}: {this.props.missionDescription}</div>

                <img id={"missionCard" + this.props.missionId}
                    src={this.state.complete ? this.props.missionCompleteCard : this.props.missionActiveCard}
                    alt={"Card for mission " + this.props.missionId} />
                <button onClick={this.completeMission}>Complete!</button>
            </div>
        )
    }
}

export default App;
