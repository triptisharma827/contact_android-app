import React, { useState, useEffect , useRef} from 'react';
import Contacts from 'react-native-contacts';
import asImage from './as.png';
import { Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {
  SafeAreaView,ScrollView,StatusBar,StyleSheet,Text,TextInput,TouchableOpacity,Image,Animated,useColorScheme,View,PermissionsAndroid,Alert,
} from 'react-native';

function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const [cnt, setCnt] = useState();
  const [record, setr] = useState([]);
  const [search, setsearch] = useState(true);
  const [inputText, setInputText] = useState('');
  const [business, setbusiness] = useState(0);
  const [family, setfamily] = useState(0);
  const [friends, setfriends] = useState(0);
  const screenHeight = Dimensions.get('window').height;
  const screenWidth = Dimensions.get('window').width;
  const [stage, setStage] = useState(false);
  const contentWidth = useRef(new Animated.Value(0)).current;
  const showContent = () => {
    setStage(true);
    Animated.timing(contentWidth, {
      toValue: 125,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const hideContent = () => {
    setStage(false);
    Animated.timing(contentWidth, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };
  const fetchContactsCount = async () => {
    try {
      const permission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS
      );


      if (permission === PermissionsAndroid.RESULTS.GRANTED) {
        const count = await Contacts.getCount();
        setCnt(count);
        console.log(count);

        if (count !== 0) {
          Contacts.getAll()
            .then(contacts => {
              contacts.sort((a, b) =>
                a.displayName.toLowerCase().localeCompare(b.displayName.toLowerCase())
              );

              setr(contacts);
              
              contacts.forEach((item) => {
                
                
                if (item['note']&&item['note'].toLowerCase() == 'business') {
                  setbusiness(prevBusiness => prevBusiness + 1);
                } else if (item['note']&&item['note'].toLowerCase() == 'family') {
                  setfamily(prevFamily => prevFamily + 1);
                } else if (item['note']&&item['note'].toLowerCase() == 'friends') {
                  setfriends(prevFriends => prevFriends + 1);
                }

                
              });
            })
            .catch(e => {
              Alert.alert('Permission to access contacts was denied');
              console.warn('Permission to access contacts was denied');
            });
        }
      } else if (permission === PermissionsAndroid.RESULTS.DENIED) {
        console.log('Permission denied by user.');
      } else if (permission === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        console.log('Permission denied by user and cannot be requested again.');
      }
    } catch (error) {
      console.log('Error requesting permission:', error);
    }
    
  };

  useEffect(() => {
    fetchContactsCount();
  }, []);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? 'grey' : 'grey',
    height: screenHeight,
  };

  function handleSearch(text) {
    setInputText(text);
    if (text.length) {
      setsearch(false);
      Contacts.getContactsMatchingString(text)
        .then(contacts => {
          contacts.sort((a, b) =>
            a.displayName.toLowerCase().localeCompare(b.displayName.toLowerCase())
          );
          setr(contacts);
        })
        .catch(e => {
          Alert.alert('Permission to access contacts was denied');
          console.warn('Permission to access contacts was denied');
        });
    } else {
      setsearch(true);
      fetchContactsCount();
    }
  }

  const handleAlert = (a, s, d) => {
    Alert.alert(
      s ,//+ '\n' + s,
      (d && d.length > 0) ? d[0].number : a,
      [
        { text: 'OK', style: 'cancel' },
      ]
    );
  }

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />

      <View style={{ ...styles.header, backgroundColor: '#27374D',alignItems:'center' }}>
        <Text style={{ fontSize: 20,color:'white' }}>MY CONTACT APP</Text>
      </View>

      {search && (
        <View style={{ ...styles.search, width:stage? screenWidth - 135 :screenWidth-40,marginLeft:stage? 130:20}}>
          <Image source={asImage} style={{ width: 20, height: 20, alignSelf: 'center', marginStart: 15 }} />
        </View>
      )}
      
      <TextInput
        style={{ ...styles.search, zIndex: 1, width:stage?  screenWidth - 135 :screenWidth-40, marginLeft:stage? 130:20}}
        underlineColorAndroid="transparent"
        placeholder="                                 Search"
        value={inputText}
        placeholderTextColor="#3C3C47"
        autoCapitalize="none"
        onChangeText={text => handleSearch(text)}
      />
      {!stage && (
        <TouchableOpacity onPress={showContent} style={{position: 'absolute',zIndex:1,marginTop:140,width:screenWidth }}>
          <Text style={{color:'#27374D' , fontSize:20, fontWeight:800, textAlign:'center'}}>Search Categories</Text>
        </TouchableOpacity>
      )}
      <View style={styles.maincontainer}>
        {/* <View style={{ backgroundColor: 'yellow', paddingLeft: 10, width: 125, height: screenHeight - 100 }}>
          <Icon name="ios-list-outline" size={24} color="black" />
          
        </View> */}

        <Animated.View style={{ width: contentWidth,height:(screenHeight-100),flexDirection: 'row',marginLeft:0}}>
      
        {stage && (<View style={{ backgroundColor: '#394867',width:125,height:screenHeight-50}}>
        
            <View>
            <TouchableOpacity onPress={hideContent} style={{backgroundColor:'#394867', marginBottom:40,}}>
              <Text style={{ fontSize : 20,color:'white'}} >X</Text>
            </TouchableOpacity>

            <Text style={{color:'white'}}>Total Contacts ({cnt})</Text>
            <Text style={{color:'white'}}>Buisness Contacts ({business})</Text>
            <Text style={{color:'white'}}>Family Contacts ({family})</Text>
            <Text style={{color:'white'}}>Friends Contacts({friends})</Text></View>
          
          
        </View>)}
      </Animated.View>

        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={{
            
            height:stage?screenHeight-120: screenHeight - 200,
            marginTop: stage?50:140
          }}
        >


          
          {record.map(item => (
            <TouchableOpacity
              key={item.recordID}
              onPress={() => handleAlert(item.recordID, item.displayName, item.phoneNumbers)}
              style={{ ...styles.container, width: screenWidth }}
            >
              {item.hasThumbnail ? (
                <Image source={{ uri: item.thumbnailPath }} style={{ width: 40, height: 40, borderRadius: 20 }} />
              ) : (
                <View style={styles.circle}>
                  <Text>{item.displayName[0]}</Text>
                </View>
              )}
              <View style={{ marginLeft: 10 }}>
                <Text style={{ color: 'white',fontWeight:800 }}>{item.displayName}</Text>
                {item.phoneNumbers && item.phoneNumbers.length > 0 && (
                  <Text style={{ color: 'white'}}>{item.phoneNumbers[0].number}</Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  maincontainer: {
    flexDirection: 'row',
    alignContent: 'center',
  },
  container: {
    flexDirection: 'row',
    alignContent: 'center',
    // backgroundColor: '#9DB2BF',
    height: 47,
    paddingLeft: 10,
    paddingTop: 7,
    marginBottom: 2,
  },

  header: {
    height: 60,
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'center',
    backgroundColor: '#151620',
  },
  search: {
    height: 40,
    borderWidth: 1,
    borderColor: '#3c3c47',
    flexDirection: 'row',
    borderRadius: 25,
    position: 'absolute',
    marginTop: 67,
    
  },

  circle: {
    backgroundColor: '#526D82',
    flexDirection: 'row',
    paddingTop: 10,
    justifyContent: 'center',
    height: 40,
    width: 40,
    borderRadius: 20,
  },
});

export default App;
