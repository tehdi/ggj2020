import React from 'react';
import './App.css';
import gameData from './gameData.js';

class App extends React.Component {

    constructor(props) {
        super(props);

        const completedMissionIds = new Set();

        this.state = {
            score: gameData.startingScore,
            rate: gameData.startingRate,
            availableMissions: this.selectMissions(completedMissionIds),
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
                <div id="stateDisplay">
                    <div>{this.state.score} / 10,000 ({this.state.rate < 0 ? "" : "+"}{this.state.rate} / turn)</div>
                </div>

                <div id="missionDisplay">
                    {missionComponents}
                </div>
            </div>
        );
    }

    selectMissions = (completedMissionIds) => {
        // don't present an already-completed mission again
        // and at any given point, we should show three distinct ones
        const allMissions = gameData.missions;
        const missionIds = new Set();
        while (missionIds.size < 3) {
            const missionId = Math.floor(Math.random() * allMissions.length);
            if (!completedMissionIds.has(missionId)) {
                missionIds.add(Math.floor(Math.random() * allMissions.length));
            }
        }

        const selectedMissions = [];
        missionIds.forEach(missionId => {
            selectedMissions.push(allMissions[missionId]);
        })
        return selectedMissions;
    }

    afterCompleteMission = (missionId) => {
        const completedMission = gameData.missions
            .find(mission => missionId === mission.id);

        const oldRate = this.state.rate;
        const newRate = this.getNewRate(completedMission);
        const completedMissionIds = this.state.completedMissionIds;
        completedMissionIds.add(missionId);

        const newAvailableMissions = this.selectMissions(completedMissionIds);

        this.setState({
            rate: newRate,
            score: this.state.score + oldRate,
            availableMissions: newAvailableMissions,
            completedMissionIds: completedMissionIds,
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
        this.setState({ image: this.props.missionCompleteCard });
        setTimeout(() => {
            this.props.afterCompleteMission(this.props.missionId);
        }, 3000);
    }
}

export default App;
