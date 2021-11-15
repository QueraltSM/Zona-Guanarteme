import React, { Component } from 'react';
import { StyleSheet, TouchableOpacity, View, Text, Linking, Image, TextInput, ScrollView, ActivityIndicator, SafeAreaView } from 'react-native';
import { createAppContainer } from 'react-navigation';
import { WebView } from 'react-native-webview';
import { BackHandler } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DatePicker from 'react-native-date-picker';
import { Icon } from 'react-native-elements';

class OffersScreen extends Component { 
    WEBVIEW_REF = "offers"
    webView = {
      canGoBack: false,
      ref: null,
    }
    beginDate = new Date()
    endDate = new Date()
  
    constructor(props) {
      super(props);
      this.state = {
        url: "https://admin.dicloud.es/zca/ofertas/index.asp",
        myLoc: false,
        datePicker1: false,
        datePicker2: false,
        showSearch: false,
        action: true,
        keyword: "",
        beginDate:  { date: new Date(), name: "01/01/"+new Date().getFullYear() },
        endDate:   { date: new Date(), name: ("0" + (new Date().getDate())).slice(-2)+"/"+("0" + (new Date().getMonth() + 1)).slice(-2)+"/"+new Date().getFullYear() },
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

    handleBackButton = ()=> {
      if (this.state.url.includes("oferta")) {
        this.props.navigation.push(this.state.back, {back: "Offers"})
      } else {
        if (this.state.canGoBack) {
          this.webView.ref.goBack()
        }
      }
      return true
    }
  
    setLocation = async () => {
      this.props.navigation.push('Home', {back: "Offers"})
    }

    setEmptyIcons() {
      return <View style={{ paddingLeft: 30, paddingTop: 30 }}><Icon name='tag' type='font-awesome' color='#1A5276'size={10} /></View>
    }

    resetSearch() {
      this.setState({ keyword: ""})
      this.setState({ showSearch: false })
      this.setState({ beginDate: { date: new Date(), name: "01/01/"+new Date().getFullYear() }})
      this.setState({ endDate: { date: new Date(), name: ("0" + (new Date().getDate())).slice(-2)+"/"+("0" + (new Date().getMonth() + 1)).slice(-2)+"/"+new Date().getFullYear()} })
    }
  
    goOffers = () => {
      this.setState({url: "https://admin.dicloud.es/zca/ofertas/index.asp" })
    }

    goScreen = async (view) => {
      this.props.navigation.push(view, {back: "SOS"})
    }
  
    setFootbar() {
      return <View style={styles.navBar}>
      <Icon
        name='exclamation-triangle'
        type='font-awesome'
        color='#FFFFFF'
        size={32}
        onPress={() => this.goScreen("SOS")}
      />
      {this.setEmptyIcons()}
      <Icon
        name='home'
        type='font-awesome'
        color='#FFFFFF'
        size={32}
        onPress={() => this.goScreen("Home")}
      />
      {this.setEmptyIcons()}
      <Icon
        name='search'
        type='font-awesome'
        color='#FFFFFF'
        size={32}
        onPress={() => this.showSearch()}/>
      </View>
    }
  
    setTitle() {
      if (!this.state.showSearch && this.state.action) return <Text style={styles.navBarHeader}>Ofertas flash del día</Text>
      return this.state.showSearch && <Text style={styles.navBarHeader}>Buscador de ofertas flash</Text>
    }

    startEndDate = () => {
      if (this.state.endDate == undefined) {
        this.setState({endDate: {date: new Date(), name: ("0" + (new Date().getDate())).slice(-2)+"/"+("0" + (new Date().getMonth() + 1)).slice(-2)+"/"+new Date().getFullYear()} })
      }
      this.setState({datePicker2: !this.state.datePicker2})
    }
  
    startBeginDate = () => {
      if (this.state.beginDate == undefined) {
        this.setState({beginDate: {date: new Date(), name: ("0" + (new Date().getDate())).slice(-2)+"/"+("0" + (new Date().getMonth() + 1)).slice(-2)+"/"+new Date().getFullYear()} })
      }
      this.setState({datePicker1: !this.state.datePicker1})
    }

    setEndDate = (date) => {
      var selectedDate = new Date(date)
      this.setState({endDate: {date: selectedDate, name: ("0" + (selectedDate.getDate())).slice(-2)+"/"+("0" + (selectedDate.getMonth() + 1)).slice(-2)+"/"+selectedDate.getFullYear()} })
    }
  
    setBeginDate = (date) => {
      var selectedDate = new Date(date)
      this.setState({beginDate: {date: selectedDate, name: ("0" + (selectedDate.getDate())).slice(-2)+"/"+("0" + (selectedDate.getMonth() + 1)).slice(-2)+"/"+selectedDate.getFullYear()} })
    }
 
    async search() {
      var action = ""
      if (this.state.keyword != "") {
        action += "keyword="+this.state.keyword
      }
      if (this.state.beginDate.date != "") {
        if (action != "") action += "&"
        action += "datebegin="+this.state.beginDate.name
      }
      if (this.state.endDate.date != "") {
        if (action != "") action += "&"
        action += "dateend="+this.state.endDate.name
      }
      if (!this.state.action) {
        if (action != "") action += "&"
        action += "action=listAll"
      }
      await this.setState({url: "https://admin.dicloud.es/zca/ofertas/index.asp?" + action })
      this.setState({ action: false })
      this.resetSearch()
    }
  
    setWebView() {
      if (this.state.showSearch) return null
        return <WebView
        ref={(webView) => { this.webView.ref = webView; }}
        originWhitelist={['*']}
        source={{ uri: this.state.url }}
        startInLoadingState={true}
        incognito={true}
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
                if (event.url.includes("drive") || event.url.includes("tel:") || event.url.includes("mailto:") || event.url.includes("maps") || event.url.includes("facebook")) {
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
    }

    closePicker(data) {
      if (data==1) this.setState({datePicker1: false})
      if (data==2) this.setState({datePicker2: false})
      this.setState({beginDate: {date: new Date(), name: ("0" + (new Date().getDate())).slice(-2)+"/"+("0" + (new Date().getMonth() + 1)).slice(-2)+"/"+new Date().getFullYear()} })
      this.setState({endDate: {date: new Date(), name: ("0" + (new Date().getDate())).slice(-2)+"/"+("0" + (new Date().getMonth() + 1)).slice(-2)+"/"+new Date().getFullYear()} })
    }

    setPicker1() {
      if (!this.state.datePicker1) {
        return <TouchableOpacity onPress={() => this.startBeginDate()}>
        <Text style={{paddingBottom: 10, fontWeight: "bold", fontSize: 17 }}>Desde fecha</Text>
        <View style={{flexDirection:"row", alignItems:"center"}}>
        <Icon name='calendar' type='font-awesome' color='black' size={20} style={{alignSelf:"flex-start"}}/>
        <Text style={styles.textBox}>{this.state.beginDate.name}</Text>
        </View>
        </TouchableOpacity>
      }
      return <View style={styles.viewPicker}>
        <DatePicker date = {this.state.beginDate.date} mode="date" textColor='#148F77' placeholder="select date" format="DD-MM-YYYY" onDateChange={(date) => this.setBeginDate(date)}/>
        <View style={{flexDirection:"row" }}><TouchableOpacity onPress={() => this.closePicker(1)}><Text style={styles.button}><Icon name='times' type='font-awesome' color='#922B21' size={32} /></Text></TouchableOpacity> 
        <TouchableOpacity onPress={() => this.startBeginDate()}><Text style={styles.button}><Icon name='save' type='font-awesome' color='#1E76B3' size={30} /></Text></TouchableOpacity> 
        </View></View>
    }

    setPicker2() {
      if (!this.state.datePicker2) {
        return <TouchableOpacity onPress={() => this.startEndDate()}>
        <Text style={{paddingBottom: 10, fontWeight: "bold", fontSize: 17 }}>Hasta fecha</Text>
        <View style={{flexDirection:"row", alignItems:"center"}}>
        <Icon name='calendar' type='font-awesome' color='black' size={20} style={{alignSelf:"flex-start"}}/>
        <Text style={styles.textBox}>{this.state.endDate.name}</Text>
        </View>
        </TouchableOpacity>
      }
      return <View style={styles.viewPicker}>
      <DatePicker style={styles.datePickerStyle} date = {this.state.endDate.date} mode="date" textColor='#148F77' placeholder="select date" format="DD-MM-YYYY" onDateChange={(date) => this.setEndDate(date)}/>
      <View style={{flexDirection:"row"}}><TouchableOpacity onPress={() =>  this.closePicker(2)}><Text style={styles.button}><Icon name='times' type='font-awesome' color='#922B21' size={32} /></Text></TouchableOpacity> 
      <TouchableOpacity onPress={() => this.startEndDate()}><Text style={styles.button}><Icon name='save' type='font-awesome' color='#1E76B3' size={30} /></Text></TouchableOpacity> 
      </View></View>
    }

    setSearchForm() {
      return (<View>
          <View style={{ paddingTop: 30 }}>
            <TextInput multiline={true} blurOnSubmit={true} style = { styles.wordBox } placeholder="Ej. Disoft, descuento, promoción" onChangeText={(keyword) => this.setState({keyword: keyword})}  value={this.state.keyword}/> 
          </View>
          <View style={{ paddingTop: 30 }}>
            <TouchableOpacity onPress={() => this.search()}>
              <Text style={styles.searchButton}>Filtrar</Text>
            </TouchableOpacity>  
          </View>
        </View>)
    }

    render(){
      return(<SafeAreaView style={{flex: 1,backgroundColor:"#1A5276"}}><View style={{flex: 1}}>
        <View style={styles.navBar}>
          {this.setTitle()}
        </View>
        {this.state.showSearch && (
        <ScrollView style={{backgroundColor:"white"}}><View style={styles.searchBack}>
          <View style={styles.formBox}>
            {this.setPicker1()}
          </View>
          <View style={styles.formBox}>
            {this.setPicker2()}
          </View>
          {this.setSearchForm()}
          </View>
        </ScrollView>)}
          {this.setWebView()}
          {this.setFootbar()}
      </View></SafeAreaView>)
    }
  }
  
  export default createAppContainer(OffersScreen);

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
    formBox: {
      width: "80%",
      alignSelf: "center",
      padding: 10,
      paddingTop: 30,
      borderColor: "lightgray",
      borderTopWidth: 0,
      borderBottomWidth: 0.5,
    },
    textBox: {
      fontSize: 20,
      textAlign: "center",
      padding: 5,
      borderRadius: 10,
      color: "#148F77"
    },
    wordBox: {
      textAlign: "justify",
      fontSize: 20,
      borderWidth: 1,
      color: "black",
      borderColor: "lightgray",
      width: "80%",
      alignSelf: "center",
      padding: 10
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
    searchButton: {
      fontSize: 15,
      color: "white",
      fontWeight: "bold",
      alignSelf: "center",
      textTransform: 'uppercase',
      paddingLeft: 20,
      paddingRight: 20,
      paddingTop: 10,
      paddingBottom: 10,
      borderRadius: 20,
      backgroundColor: "#148F77"
    },
    button: {
      fontSize: 15,
      color: "white",
      fontWeight: "bold",
      alignSelf: "center",
      textTransform: 'uppercase',
      paddingLeft: 20,
      paddingRight: 20,
      paddingTop: 10,
      paddingBottom: 10,
      borderRadius: 20,
      backgroundColor: "white"
    },
    searchBack: {
      backgroundColor: "#fff",
      paddingBottom: 30
    },
    datePickerStyle: {
      backgroundColor:"#fff",
      alignSelf: "center",
      fontSize: 5,
      color: "#1A5276"
    },
    viewPicker: {
      paddingTop: 10,
      paddingBottom: 10,
      alignSelf: "center",
      alignItems: "center"
    },
  });
  