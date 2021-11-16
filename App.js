import React, { Component } from 'react';
import { StyleSheet, View, Text, Image, SafeAreaView } from 'react-native';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OffersScreen from './Offers.js'
import HelpScreen from './Help.js'
import SOSScreen from './SOS.js'
import HomeScreen from './Home.js'

class MainScreen extends Component { 

  constructor(props) {
    super(props);
  }

  async componentDidMount() {
    var firstTime = false
    await new Promise(resolve => setTimeout(resolve, 1000));
    await AsyncStorage.getItem("first-time").then((value) => {
      if (value == null) firstTime = true
    })
    if (firstTime) this.props.navigation.push('Help', {back: "Help"});
    else this.props.navigation.push('Home', {back: "Home"});
    await AsyncStorage.setItem("first-time", "yes");
  }

  render(){
    return(<SafeAreaView style={{flex: 1,backgroundColor:"#1A5276"}}>
        <View style={styles.mainView}>
          <View>
            <Image source={require('./assets/logoZG.png')}style={{ width: 100, height: 100, alignSelf: "center", marginBottom:20 }}/>
            <Text style={styles.mainHeader}>Zona Comercial</Text>
            <Text style={styles.mainHeader}>Abierta Guanarteme</Text>
          </View>
          <View style={styles.cabildoView}>
            <Image source={require('./assets/cabildo-gc.jpg')} style={{ width: 100, height: 100, alignSelf: "center", marginBottom:20 }}/>
            <Text style={styles.subHeader}>Financia: Cabildo Gran Canaria. Consejería de Industria, Comercio y Artesanía</Text>
          </View>
      </View></SafeAreaView>)
  }
}

export class Company {
  constructor(id, description, coordenadasmap) {
    this.id = id;
    this.description = description;
    this.coordenadasmap = coordenadasmap
  }
}

export class Sugerencia {
  constructor(id, description, coordenadasmap, comments) {
    this.id = id;
    this.description = description;
    this.coordenadasmap = coordenadasmap;
    this.comments = comments;
  }
}

const AppNavigator = createStackNavigator({
  Main: {
    screen: MainScreen,
    navigationOptions: {
      header: null,
      animationEnabled: false
    }
  },
  Home: {
    screen: HomeScreen,
    navigationOptions: {
      header: null,
      animationEnabled: false
    }
  },
  SOS: {
    screen: SOSScreen,
    navigationOptions: {
      header: null,
      animationEnabled: false
    }
  },
  Help: {
    screen: HelpScreen,
    navigationOptions: {
      header: null,
      animationEnabled: false
    }
  },
  Offers: {
    screen: OffersScreen,
    navigationOptions: {
      header: null,
      animationEnabled: false
    }
  },
});

export default createAppContainer(AppNavigator);

const styles = StyleSheet.create({
  mainApp: {
    flex: 1,
    alignSelf: "center",
  },
  cabildoView: {
    padding: 20,
    width:"100%",
    alignContent:"center",
    textAlign: "center",
    position: 'absolute',
    bottom: 0
  },
  mainView: {
    backgroundColor:"#1A5276",
    flex: 1,
    justifyContent: 'center',
  },
  mainHeader: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    alignSelf: "center",
    fontSize: 25,
  },
  subHeader: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    alignSelf: "center",
    textAlign:"center",
    fontSize: 15,
  },
});