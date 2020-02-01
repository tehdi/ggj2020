import React from 'react';
import './App.css';
import game_data from './gameData.js';

class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            temperature: game_data.starting_temperature,
            rate: game_data.starting_rate,
            event_log: []
        }
    }

    endTurn = () => {
        const start_temp = this.state.temperature;
        const rate = this.state.rate;
        this.setState({ temperature: start_temp + rate });
    }

    drawCard = () => {
        const events = game_data.events;
        const event = game_data.events[Math.floor(Math.random() * events.length)];
        this.state.event_log.unshift(event);
    }

    endClimateChange = () => {
        this.setState({
            temperature: 10,
            rate: 0
        });
    }

    render() {
        // const event_log = this.state.event_log
        //     .map(event => {
        //         console.log(event);
        //         return <span key={event.id}>{event.description}</span>
        //     });

        return (
            <div className="App">
                <div id="stateDisplay">
                    <div>{this.state.temperature} ({this.state.rate < 0 ? "-" : ""}{this.state.rate} / turn)</div>
                    {/* <div>{this.state.event_log}</div> */}
                </div>
                <div id="turnActions">
                    <button onClick={this.drawCard}>Draw an Event Card</button>
                </div>
                <button onClick={this.endTurn}>End Turn</button>
                <button onClick={this.endClimateChange}>End Climate Change</button>
            </div>
        );
    }
}

export default App;
