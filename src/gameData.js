const game_data = {
    starting_temperature: 20,
    starting_rate: 1,
    events: [
        {
            id: 0,
            description: "One of your enviro-repair mechs has broken down",
            temperature_impact: 1,
            rate_impact: 0
        },
        {
            id: 1,
            description: "Wildfires have broken out in Australia",
            temperature_impact: 2,
            rate_impact: 1
        },
        {
            id: 2,
            description: "",
            temperature_impact: -1,
            rate_impact: 0
        },
        // bribe a politician
        // topple a fascist regime
        // elect a new US president
        // sign the Paris Accord
        // sign the Kyoto Accord
    ],
    objectives: [
        {
            id: 0,
            description: "",
            requirement: "",
            reward: ""
        }
    ]
};

export default game_data;
