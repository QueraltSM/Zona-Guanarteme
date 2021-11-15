import React, { Component } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, SafeAreaView } from 'react-native';
import { createAppContainer } from 'react-navigation';
import { WebView } from 'react-native-webview';
import { BackHandler } from 'react-native';
import { Icon } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';

class HelpScreen extends Component { 

    WEBVIEW_REF = "help"
    webView = {
      canGoBack: false,
      ref: null
    }
    constructor(props) {
      super(props);
      this.state = {
        url: "https://admin.dicloud.es/zca/ayuda.html",
        myLoc: false,
        back: this.props.navigation.state.params.back,
      }
      this.init()
    }
  
    async init() {
      await AsyncStorage.getItem("myLoc").then((value) => {
        if (value == null) {
          value = true
        }
        this.setState({ myLoc: JSON.parse(value) })
      })
    }
  
    componentDidMount(){
      BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
    }
  
    handleBackButton = ()=>{
      this.props.navigation.push(this.state.back, {back: "Help"})
      return true
    }
  
    setLocation = async () => {
      this.props.navigation.push('Home', {back: "Help"})
    }
  
    goSOS = () => {
      this.props.navigation.push('SOS', {back: "Help"})
    }
  
    goOffers = () => {
      this.props.navigation.push('Offers', {back: "Help"})
    }

    setEmptyIcons() {
      return <View style={{ paddingLeft: 30, paddingTop: 30 }}><Icon name='tag' type='font-awesome' color='#1A5276'size={10} /></View>
    }

    setMenuButtons() {
      return (<View style={styles.navBar}>
        <Icon
           name='exclamation-triangle'
           type='font-awesome'
           color='#FFFFFF'
           size={32}
           onPress={this.goSOS}
         />
          {this.setEmptyIcons()}
          <Icon
           name='home'
           type='font-awesome'
           color='#FFFFFF'
           size={32}
           onPress={this.setLocation}
         />
          {this.setEmptyIcons()}
         <Icon
           name='tag'
           type='font-awesome'
           color='#FFFFFF'
           size={32}
           onPress={this.goOffers}
         />
         </View>)
      }
  
    render(){
      return(<SafeAreaView style={{flex: 1,backgroundColor:"#1A5276"}}>
        <View style={{flex: 1}}>
        <View style={styles.navBar}>
            <Text style={styles.navBarHeader}>Ayuda</Text>
        </View>
          <WebView
            ref={(webView) => { this.webView.ref = webView; }}
            originWhitelist={['*']}
            source={{ uri: this.state.url }}
            startInLoadingState={true}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            setSupportMultipleWindows={false}
            allowsBackForwardNavigationGestures
            onNavigationStateChange={(navState) => {
              this.setState({
                canGoBack: navState.canGoBack
              });
            }}
            onShouldStartLoadWithRequest={(event) => {
                if (!event.url.includes("about:blank") && !event.url.includes("recaptcha")) {
                    this.setState({ url: event.url })  
                    return true 
                }
            }}
            renderLoading={() => 
              <View style={styles.loading}>
                <ActivityIndicator color={'white'} size="large" />
            </View>}
            onError={(x) => console.log('Oh no!', x)}
            renderError={() => {
                return (
                    <View style={styles.errorView}>
                        <Text style={styles.error}>
                            Algo salió mal...
                        </Text>
                        <Text></Text>
                      <Text>Compruebe su conexión a Internet</Text>
                    </View>);
            }}
          />
            {this.setMenuButtons()}
        </View></SafeAreaView>)
    }
  }
  export default createAppContainer(HelpScreen);
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
    navBar: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:"#1A5276", 
      flexDirection:'row', 
      textAlignVertical: 'center',
      height: 50
    },
    error: {
      fontSize: 20,
      marginTop: 50,
    },
    loading: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: "#1A5276"
    },
    errorView: {
      width: '100%',
      paddingLeft: '0%',
      marginTop: 0,
      height: '100%',
      backgroundColor: 'white',
      justifyContent: 'center',
      alignItems: 'center'
    },
    date:{
      color: "#98A406",
      backgroundColor: "white"
    },
    navBarHeader: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 20
      },
  });