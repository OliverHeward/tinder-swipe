// @flow
import React from "react";
import { Asset, AppLoading } from "expo";

import { Profiles, type Profile } from "./components";

const profiles: Profile[] = [{
        id: "1",
        name: "Caroline",
        age: 24,
        profile: require("./assets/profiles/1.jpg"),
    },
    {
        id: "2",
        name: "Jack",
        age: 30,
        profile: require("./assets/profiles/2.jpg"),
    },
    {
        id: "3",
        name: "Anet",
        age: 21,
        profile: require("./assets/profiles/3.jpg"),
    },
    {
        id: "4",
        name: "John",
        age: 28,
        profile: require("./assets/profiles/4.jpg"),
    },
        {
        id: "5",
        name: "Anna",
        age: 26,
        profile: require("./assets/profiles/5.jpg"),
    },
        {
        id: "6",
        name: "Daniel",
        age: 28,
        profile: require("./assets/profiles/6.jpg"),
    },
        {
        id: "7",
        name: "Jana",
        age: 29,
        profile: require("./assets/profiles/7.jpg"),
    },
        {
        id: "8",
        name: "Brian",
        age: 27,
        profile: require("./assets/profiles/8.jpg"),
    },

];

type AppState = {
    ready: boolean,
};

export default class App extends React.Component < {}, AppState > {
    state = {
        ready: false,
    };

    async componentDidMount() {
        await Promise.all(profiles.map(profile => Asset.loadAsync(profile.profile)));
        this.setState({ ready: true });
    }

    render() {
        const { ready } = this.state;
        if (!ready) {
            return (
                <AppLoading />
            );
        }
        return (
            <Profiles {...{ profiles }} />
        );
    }
}