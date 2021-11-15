import React, { Component } from 'react';
import { StyleSheet, TouchableOpacity, View, Text, Linking, Image, TextInput, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { createAppContainer } from 'react-navigation';
import { WebView } from 'react-native-webview';
import { BackHandler } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { Icon } from 'react-native-elements'
import BackgroundFetch from 'react-native-background-fetch';
import PushNotification from 'react-native-push-notification';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Company } from './App';

class HomeScreen extends Component { 

    WEBVIEW_REF = "zca"
    map="https://admin.dicloud.es/zca/mapa.asp"
    idm="10162"
    lat=28.13598034627975
    lng=-15.436172595513227
    sos_id=0
    ofertas_id=0
    sugerencias_id=0
    comercio_id=0
    webView = {
      canGoBack: false,
      ref: null,
    }
    constructor(props) {
      super(props);
      this.state = {
        url: "",
        companies: [Company],
        noGeo: true,
        centerMap: true,
        noLoc: false,
        showSearch: false,
        timer: 0
      }
      this.init()
      this.getCompanies();
      this.getSOS();
      this.getOfertas();
      setInterval(() => {
        this.getSOS();
        this.getOfertas();
        this.getSugerencias();
        this.notifyProximity();
      }, 600000);
    }
  
    async init() {
      this.setLocation()
    }
  
    async saveId(key, value) {
      await AsyncStorage.setItem(key, value);
    }
  
    calculateDistance(lat2, lon2, title, message){
      var radlat1 = Math.PI * this.lat/180
      var radlat2 = Math.PI * lat2/180
      var theta = this.lng-lon2
      var radtheta = Math.PI * theta/180
      var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
      dist = Math.acos(dist)
      dist = dist * 180/Math.PI
      dist = dist * 60 * 1.1515
      dist = dist * 1.609344 * 1000
      if (dist <= 55) {
        this.pushNotification(title,message)
      }
    }
  
    async notifyProximity() {
      await AsyncStorage.getItem("Comercio-id").then((value) => {
        if (value == null) this.comercio_id = 0
        else this.comercio_id = value;
      })
      this.state.companies.forEach(company => {
        if (this.comercio_id < company.id && this.comercio_id != 0) {
          this.saveId("Comercio-id", String(company.id))
          var coords=company.coords+""
          var lat2 = coords.split("*")[0] + ""
          var lng2 = coords.split("*")[1] + ""
          var message = company.description + " está cerca de ti"
          this.calculateDistance(lat2, lng2, "Comercio cercano", message)
        }
      });
    }
  
    async getCompanies() {
      var companies = [Company]
      await fetch('https://app.dicloud.es/getCompanies.asp', {})
      .then((response) => response.json())
      .then((responseJson) => {
        responseJson.companies.forEach(company => {
          var c =  {
            id: company.id,
            description: company.description,
            coords: company.coordenadasmap
          }
          companies.push(c);
        });
        this.setState({ companies: companies })
        this.notifyProximity();
      }).catch(() => {});
    }
  
    async getSOS() {
      await AsyncStorage.getItem("SOS-id").then((value) => {
        if (value == null) {
          this.sos_id = 0
        } else {
          this.sos_id = value;
        }
      })
      fetch('https://app.dicloud.es/getSOS.asp', {})
      .then((response) => response.json())
      .then((responseJson) => {
        responseJson.sos.forEach(sos => {
          var now = new Date()
          var sos_begin_date = new Date(sos.begin_date)
          if (this.sos_id < sos.id && now.toLocaleDateString() == sos_begin_date.toLocaleDateString()) {
            this.saveId("SOS-id", String(sos.id))
            this.pushNotification("Emergencia", sos.title_es)
          }
        });
      }).catch(() => {});
    }
  
    async getSugerencias() {
      await AsyncStorage.getItem("Sugerencias-id").then((value) => {
        if (value == null) {
          this.sugerencias_id = 0
        } else {
          this.sugerencias_id = value;
        }
      })
      fetch('https://app.dicloud.es/getSugerencias.asp', {})
      .then((response) => response.json())
      .then((responseJson) => {
        responseJson.sugerencias.forEach(sugerencia => {
          var coords = sugerencia.coordenadasmap + ""
          if (coords != "") {
            if (this.sugerencias_id < sugerencia.id) {
              var lat2 = coords.split("*")[0] + "";
              var lng2 = coords.split("*")[1] + "";
              var message = "Sugerencia de " + sugerencia.description
              this.calculateDistance(lat2, lng2, "Sugerencias y ofertas del dia", message)
              this.saveId("Sugerencias-id", String(sugerencia.id))
              this.sugerencias_id = sugerencia.id
            }
          }
        });
      }).catch(() => {});
    }
  
    async getOfertas() {
      await AsyncStorage.getItem("Ofertas-id").then((value) => {
        if (value == null) {
          this.ofertas_id = 0
        } else {
          this.ofertas_id = value;
        }
      })
      var firstTime = false
      await AsyncStorage.getItem("first-time").then((value) => {
        if (value == null) {
          firstTime = true
        }
      })
      fetch('https://app.dicloud.es/getOfertas.asp', {})
      .then((response) => response.json())
      .then((responseJson) => {
        responseJson.ofertas.forEach(oferta => {
          var now = new Date()
          var endDate = new Date(oferta.end_date)
          if (this.ofertas_id < oferta.id && now.getTime() <= endDate.getTime()) {
            this.saveId("Ofertas-id", String(oferta.id))
            this.pushNotification("Oferta Flash", oferta.title_es + " Hasta las " + endDate.getHours()+":"+endDate.getMinutes())
          }
        });
      }).catch(() => {});
    }
  
    configNotifications = () => {
        PushNotification.configure({
          onNotification: function(notification) {},
          permissions: {
            alert: true,
            badge: true,
            sound: true,
          },
          requestPermissions: Platform.OS === 'ios',
          popInitialNotification: true,
        });
        PushNotification.createChannel({
          channelId: "channel-id", // (required)
          channelName: "My channel", // (required)
          channelDescription: "A channel to categorise your notifications", // (optional) default: undefined.
          playSound: false, // (optional) default: true
          soundName: "default", // (optional) See `soundName` parameter of `localNotification` function
          importance: 4, // (optional) default: 4. Int value of the Android notification importance
          vibrate: true, // (optional) default: true. Creates the default vibration patten if true.
        },
        (created) => console.log(`createChannel returned '${created}'`) // (optional) callback returns whether the channel was created, false means it already existed.
      );
      this.setBackgroundFetch()
    }
  
    setBackgroundFetch = () => {
      BackgroundFetch.configure({
        minimumFetchInterval: 15, // fetch interval in minutes
        enableHeadless: true,
        stopOnTerminate: false,
        periodic: true,
      },
      async taskId => {
        this.getSOS();
        this.getOfertas();
        this.getSugerencias();
        BackgroundFetch.finish(taskId);
      },
      error => {
        console.error('RNBackgroundFetch failed to start.');
        },
      );
    }
  
    pushNotification = (title, message) => {
      PushNotification.localNotification({
        title: title,
        message: message,
        playSound: true,
        soundName: 'default',
        channelId: "channel-id"
      });
    }
  
    componentDidMount(){
      this._isMounted = true
      this.setState({ companies: [] })
      BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
      this.configNotifications()
    }
  
    async setURL(lat, lng) {
      await this.setState({ url: this.map + "?idm="+this.idm+"&lat="+lat+ "&lng="+lng + "&movil=si&locCenter="+this.state.centerMap })
    }

    async showAlert (title, message) {
      const AsyncAlert = () => new Promise((resolve) => {
        Alert.alert(
          title,
          message,
          [
            {
              text: 'Ok',
              onPress: () => {
                resolve();
              },
            },
          ],
          { cancelable: false },
        );
        });
      await AsyncAlert();
    }
  
    errorCallbackEnter = async () => {
      await this.setState({ noGeo: true })
      this.showAlert("Error", "Debe activar el GPS para acceder a esta función")
    }

    errorCallback = async (e) => {
      console.log("errorCallback:"+JSON.stringify(e))
      await this.setState({ noGeo: true })
    }

   successCallback = async (pos) => {
      await this.setState({ noGeo: false })
      var crd = pos.coords
      this.setURL(crd.latitude, crd.longitude)
    }

    async setLocation() {
      if (this.state.centerMap) {
        await this.setState({ noGeo: false })
        this.setURL(28.13598034627975,-15.436172595513227)
      } else await Geolocation.getCurrentPosition(this.successCallback,this.errorCallback,{enableHighAccuracy: false, timeout: 5000});
    }
  
    async goHome() {
      this.setState({ showSearch: false })
      var newCenterMap = !JSON.parse(this.state.centerMap)
      this.setState({ centerMap: newCenterMap })
      await new AsyncStorage.setItem("centerMap", JSON.stringify(newCenterMap))
      if (newCenterMap) {
        this.setURL(28.13598034627975,-15.436172595513227)
      } else {
        this.props.navigation.push('Home', {back: "Home"})
      }
   }

   async centerMap () {
     this.setState({centerMap: !this.state.centerMap})
     await this.setState({ url: this.map + "?idm="+this.idm+"&lat=28.13598034627975&lng=-15.436172595513227&movil=si&locCenter=true" })
   }
  
   async checkMyLocation() {
    await Geolocation.getCurrentPosition(this.successCallback,this.errorCallbackEnter,{enableHighAccuracy: false, timeout: 5000});
   }

   async setMyLocation() {
    this.setState({centerMap: !this.state.centerMap})
    await Geolocation.getCurrentPosition(this.successCallback,this.errorCallback,{enableHighAccuracy: false, timeout: 5000});
   }

   setLocationIcon() {
     if (!this.state.centerMap) {
        return <TouchableOpacity onPress={() => this.centerMap()}>
        <Image source={require('./assets/locationOff.png')} />
      </TouchableOpacity>;
      } 
      return <TouchableOpacity onPress={() => this.setMyLocation()}>
          <Image source={require('./assets/locationOn.png')} />
        </TouchableOpacity>;
   }
    
    handleBackButton = ()=>{
      if (this.state.canGoBack) {
        this.webView.ref.goBack();
        return true;
      }
      return true
    }
  
    setTitle = () => {
      if (this.state.centerMap) return <View style={styles.navBar}><Text style={styles.navBarHeader}>Centro de Guanarteme</Text></View>
      if (!this.state.noGeo) return <View style={styles.navBar}><Text style={styles.navBarHeader}>Mi ubicación</Text></View>
      return null
    }
  
    goScreen = (view) => {
      this.props.navigation.push(view, {back: "Home"})
    }
  
    searchInMap = async () => {
      this.setState({ showSearch: !this.state.showSearch})
    }
  
    async searchMap() {
      await this.setState({ url: this.map + "?idm="+this.idm+"&lat="+this.lat+ "&lng="+this.lng + "&movil=si&buscador="+this.state.mapData })
      this.setState({ mapData: ""}) 
      this.setState({ showSearch: false })
      this.setState({ centerMap: true })
    }
  
    showSearchInput() {
      if (this.state.showSearch) {
        return  <View style={styles.searchMapBack}>
          <TextInput multiline={true} blurOnSubmit={true} value={this.state.mapData} placeholderTextColor={"drakgray"} placeholder="Calle, empresa o categoría" style ={{ alignSelf: 'center', textAlign: 'center', fontSize: 17 }} onChangeText={(mapData) => this.setState({mapData})}  />
        <TouchableOpacity onPress={()=>this.searchMap()}>
        <Text style={styles.searchButton}>Buscar comercios</Text>
        </TouchableOpacity> 
        </View>
      }
      return null;
    }
  
    setEmptyIcons() {
      return <View style={{ paddingLeft: 30, paddingTop: 30 }}><Icon name='tag' type='font-awesome' color='#1A5276'size={10} /></View>
    }

    setMenuButton() {
      return (<View style={styles.navBar}>
        <Icon
          name='exclamation-triangle'
          type='font-awesome'
          color='#FFFFFF'
          size={32}
          onPress={() => this.goScreen("SOS")}
        />
        {this.setEmptyIcons()}
        <Icon
          name='tag'
          type='font-awesome'
          color='#FFFFFF'
          size={32}
          onPress={() => this.goScreen("Offers")}
        />
        {this.setEmptyIcons()}
        {this.setLocationIcon()}
        {this.setEmptyIcons()}
        <Icon
          name='search'
          type='font-awesome'
          color='#FFFFFF'
          size={32}
          onPress={() => this.searchInMap()}
        />
        {this.setEmptyIcons()}
        <Icon
          name='info-circle'
          type='font-awesome'
          color='#FFFFFF'
          size={35}
          onPress={() => this.goScreen("Help")}
        />
      </View>)
    }

    setLocationProlog = () => {
      return (<View style={styles.mainView}>
        <Text style={styles.mainHeaderGPS}>Debe activar el GPS para acceder a esta función</Text>
        <TouchableOpacity onPress={() => this.checkMyLocation()}>
        <Text style={styles.enterGuanarteme}>ENTRAR</Text>
        </TouchableOpacity>
      </View>)
    }

    setWebview = () => {
      return <WebView
      ref={(webView) => { this.webView.ref = webView; }}
      originWhitelist={['*']}
      source={{ uri: this.state.url }}
      startInLoadingState={true}
      incognito={true}
      cacheEnabled={true}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      setSupportMultipleWindows={false}
      allowsBackForwardNavigationGestures
      onNavigationStateChange={(navState) => {
        this.setState({ canGoBack: navState.canGoBack });
      }}
      onShouldStartLoadWithRequest={(event) => {
        if (!event.url.includes("about:blank") && !event.url.includes("recaptcha")) {
            if (event.url.includes("tel:") || event.url.includes("mailto:") || event.url.includes("maps") || event.url.includes("facebook")) {
                Linking.canOpenURL(event.url).then((value) => {
                  if (value) Linking.openURL(event.url)
                })
                return false
              } else {
                this.setState({ url: event.url })  
                return true 
              }
        }
      }}
      renderLoading={() => 
        <View style={styles.loading}>
          <Text style={styles.mapConection}>Cargando mapa de Guanarteme...</Text>
          <ActivityIndicator color={'white'} size="large" />
      </View>}
      onError={(x) => console.log('Oh no!', x)}
            renderError={() => {
                return (
                    <View style={styles.errorView}>
                        <Text style={styles.error}>
                            Sin conexión
                        </Text>
                        <Text></Text>
                      <Text>Compruebe su conexión a Internet</Text>
                    </View>);
            }}
      />
    }

    render() {
        if (this.state.noGeo && !this.state.centerMap) {
          return (<SafeAreaView style={{flex: 1,backgroundColor:"#1A5276"}}><View style={{flex: 1}}>
            {this.setLocationProlog()}
            {this.setMenuButton()}
          </View></SafeAreaView>)
        } else {
          return(<SafeAreaView style={{flex: 1,backgroundColor:"#1A5276"}}><View style={{flex: 1}}>
            {this.setTitle()}
            {this.showSearchInput()}
            {this.setWebview()}
            {this.setMenuButton()}
        </View></SafeAreaView>)
      }
    }
  }
  
  export default createAppContainer(HomeScreen);

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
    textBox: {
      fontSize: 18,
      alignSelf: 'stretch',
      height: 45,
      paddingLeft: 8,
      color:"#98A406",
      borderWidth: 2,
      paddingVertical: 0,
      borderColor: '#98A406',
      borderRadius: 0,
      margin: 10,
      borderRadius: 20,
      textAlign: "center"
    },
    date:{
      color: "#98A406",
      backgroundColor: "white"
    },
    navBarButton: {
      color: '#FFFFFF',
      textAlign:'center',
      width: 64
    },
    navBarHeader: {
      color: '#FFFFFF',
      fontWeight: 'bold',
      fontSize: 20
    },
    mainView: {
      backgroundColor:"#1A5276",
      flex: 1,
      justifyContent: 'center',
    },
    mainHeader: {
      color: '#FFFFFF',
      fontWeight: 'bold',
      fontSize: 25,
      alignSelf: "center"
    },
    mainHeaderGPS: {
      color: '#FFFFFF',
      fontWeight: 'bold',
      fontSize: 20,
      alignSelf: "center",
      width:"90%",
      textAlign:"center"
    },
    enterGuanarteme: {
      color: '#27AE60',
      fontWeight: 'bold',
      fontSize: 20,
      alignSelf: "center",
      paddingTop: 30
    },
    searchButton: {
      fontSize: 15,
      color: "#922B21",
      fontWeight: "bold",
      alignSelf: "center",
      paddingTop: 13,
      paddingBottom: 2,
      textTransform: 'uppercase',
    },
    searchMapBack: {
        padding: 10,
        backgroundColor: "#fff",
        paddingBottom: 5
    },
    mapConection: {
      color: "white",
      fontSize: 20,
      paddingBottom: 30,
      fontWeight: 'bold',
    }
  });