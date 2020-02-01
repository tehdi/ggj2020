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

    render() {
        const availableMissions = this.selectMissions();

        const missionComponents = availableMissions
            .map(mission => {
                return <Mission
                    key={mission.id}
                    missionId={mission.id}
                    missionDescription={mission.description}
                    onCompleteMission={this.completeMission} />
            });

        return (
            <div className="App">
                <div id="stateDisplay">
                    <div>{this.state.score} ({this.state.rate < 0 ? "" : "+"}{this.state.rate} / turn)</div>
                </div>

                <div>
                    {missionComponents}
                </div>

                <button onClick={this.endClimateChange}>End Climate Change</button>
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

    endClimateChange = () => {
        this.setState({
            score: 10,
            rate: 0,
            availableMissions: []
        });
    }
}

class Mission extends React.Component {
    completeMission = () => {
        this.props.onCompleteMission(this.props.missionId);
    }

    render() {
        return (
            <div className="missionBox">
                <div>Mission {this.props.missionId}: {this.props.missionDescription}</div>
                <button onClick={this.completeMission}>Complete!</button>
            </div>
        )
    }
}

export default App;
