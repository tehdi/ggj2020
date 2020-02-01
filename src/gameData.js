const gameData = {
    startingScore: 20,
    goalScore: 10,
    failScore: 100,
    startingRate: 2,
    missions: [
        {
            id: 0,
            description: "Sign the Kyoto Protocol",
            scoreImpact: 0,
            rateImpact: -1,
            // description, background image (maybe), and requirements will be on the card image
        },
        {
            id: 1,
            description: "Extinguish the Australian wildfires",
            scoreImpact: -1,
            rateImpact: 0,
        },
        {
            id: 2,
            description: "Sign the Paris Accord",
            scoreImpact: 0,
            rateImpact: -1,
        },
        {
            id: 3,
            description: "Start a coup",
            scoreImpact: 1,
            rateImpact: -1,
        },
        {
            id: 4,
            description: "Build a solar energy farm",
            scoreImpact: -1,
            rateImpact: -1,
        },
        {
            id: 5,
            description: "Build a wind energy farm",
            scoreImpact: -1,
            rateImpact: -1,
        },
        {
            id: 6,
            description: "Stop malaria outbreak",
            scoreImpact: 0,
            rateImpact: 0,
        },
        {
            id: 7,
            description: "Lease a rainforest",
            scoreImpact: 0,
            rateImpact: -1,
        },
        {
            id: 8,
            description: "Plant trees",
            scoreImpact: -1,
            rateImpact: -1,
        },
        {
            id: 9,
            description: "Sabotage a coal power plant",
            scoreImpact: 0,
            rateImpact: -1,
        },
        {
            id: 10,
            description: "Open a recycling plant",
            scoreImpact: 0,
            rateImpact: -1,
        },
        /*
        {
            id: ,
            description: "",
            scoreImpact: ,
            rateImpact: ,
        },
        */
    ],
    random_events: [
        {
            id: 0,
            description: "Thanos snap",
            scoreImpact: 5,
            rateImpact: -5,
        },
        {
            id: 1,
            description: "Mount Vesuvius erupts",
            scoreImpact: 0,
            rateImpact: 0,
        },
    ]
};

export default gameData;
