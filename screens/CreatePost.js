import React, {Component} from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Image, StatusBar, ScrollView, Alert} from 'react-native';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import DropDownPicker from 'react-native-dropdown-picker';
import {SafeAreaView} from 'react-native-safe-area-context';
import { RFValue } from 'react-native-responsive-fontsize';

import { getAuth } from 'firebase/auth';
import { ref, onValue, set } from 'firebase/database';
import db from '../config';

SplashScreen.preventAutoHideAsync();

let customFonts = {
    'salsa': require('../assets/font/Salsa-Regular.ttf')
}

let preview_images = {
    image_1: require("../assets/image_1.jpg"),
    image_2: require("../assets/image_2.jpg"),
    image_3: require("../assets/image_3.jpg"),
    image_4: require("../assets/image_4.jpg"),
    image_5: require("../assets/image_5.jpg"),
    image_6: require("../assets/image_6.jpg"),
    image_7: require("../assets/image_7.jpg"),
}

export default class CreatePost extends Component {
    constructor(props) {
        super(props);
        this.state={
            fontsLoaded: false,
            previewImage: 'image_1',
            dropDownHeight: 40,
            previewImageLabel: 'Image 1',
            light_theme: true,
            profile_image: require('../assets/profile_img.png')
        }
    }

    async _loadFontsAsync() {
        await Font.loadAsync(customFonts);
        this.setState({fontsLoaded: true})
    }

    componentDidMount() {
        this._loadFontsAsync();
        this.fetchUser();
    }

    async fetchUser() {
        let theme;
        const auth = getAuth();
        const userId = auth.currentUser.uid;
    
        onValue(ref(db, '/users/' + userId), (snapshot) => {
          theme = snapshot.val().current_theme;
          this.setState({
            light_theme: theme === 'light' ? true : false,
          })
        })
    }

    async addPost() {
        const auth = getAuth();
        const userId = auth.currentUser.uid;

        if(this.state.caption) {
            let postData = {
                preview_image: this.state.previewImage,
                caption: this.state.caption,
                author: auth.currentUser.displayName,
                created_on: new Date(),
                author_uid: userId,
                profile_image: this.state.profile_image,
                likes: 0,
            };

            const dbRef = ref(db, '/posts/' + Math.random().toString(36).slice(2));
            set(dbRef, postData);

            //this.props.setUpdateToTrue();
            this.props.navigation.navigate('Feed');
        } else {
            Alert.alert(
                'Error',
                'All fields are required!',
                [{text: 'OK', onPress: () => console.log('OK Pressed')}],
                {cancelable: false}
            )
        }
    }

    render() {
        if(this.state.fontsLoaded) {
            SplashScreen.hideAsync();

            return(

            <View style={this.state.light_theme ? styles.containerLight: styles.container}>

                <SafeAreaView style={styles.droidSafeArea} />

                <View style={styles.appTitle}>

                    <View style={styles.appIcon}>
                        <Image source={require("../assets/logo.png")} style={styles.iconImage} />
                    </View>
                    <View style={styles.appTitleTextContainer}>
                        <Text style={this.state.light_theme ? styles.appTitleTextLight: styles.appTitleText}>New Post</Text>
                    </View>

                </View>

                 <View style={styles.fieldsContainer}>
                    

                        <Image source={preview_images[this.state.previewImage]} style={styles.previewImage}/> 

                        
                        <View style={{height: RFValue(this.state.dropDownHeight) }}>
                            <DropDownPicker items={[
                                {label: "Image 1", value: "image_1"},
                                {label: "Image 2", value: "image_2"},
                                {label: "Image 3", value: "image_3"},
                                {label: "Image 4", value: "image_4"},
                                {label: "Image 5", value: "image_5"},
                                {label: "Image 6", value: "image_6"},
                                {label: "Image 7", value: "image_7"},
                            ]}
                            
                            defaultValue={this.state.previewImage}
                            
                            //containerStyle={{height: 40, borderRadius: 20, marginBottom: 10}}

                            open={this.state.dropDownHeight == 170 ? true : false}

                            theme = "DARK"

                            onOpen={() => {
                                this.setState({dropDownHeight: 170});
                            }}
                            
                            onClose={() => {
                                this.setState({dropDownHeight: 40});
                            }}
                            
                            style={this.state.light_theme ? styles.dropDownPickerLight : styles.dropDownPicker}

                            placeholder={this.state.previewImageLabel}
                            
                            dropDownStyle={{color: 'black'}}
                            
                            textStyle={{color: this.state.light_theme ? 'black' : 'white', fontFamily: 'salsa'}}
                            
                            onSelectItem={item => this.setState({previewImage: item.value, previewImageLabel: item.label})}/>
                        </View>
                    <ScrollView style={{padding:RFValue(15)}}>
                        <TextInput 
                        style={styles.inputFont}
                        onChangeText={caption => this.setState({caption})}
                        placeholder={'Caption'}
                        placeholderTextColor = {this.state.light_theme ? 'black' : 'white'}
                        />
                        <TouchableOpacity style={styles.submitButton} onPress={() => this.addPost()}>
                            <Text style={styles.submitText}>Submit</Text>
                        </TouchableOpacity>

                    </ScrollView>
                </View> 

            <View style={{flex: 0.08}} />
            </View>

            )
        }
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },

    containerLight: {
        flex: 1,
        backgroundColor: 'white',
    },

    droidSafeArea: {
        marginTop: Platform.OS === 'android' ? StatusBar.currentHeight -45 : RFValue(35)
    },

    appTitle: {
        flex: 0.07,
        flexDirection: 'row'
    },

    appIcon: {
        flex: .2,
        justifyContent: 'center',
        alignItems: 'center',
    },

    iconImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },

    appTitleTextContainer: {
        flex: .8,
        justifyContent: 'center',
    },

    appTitleText: {
        color: 'white',
        fontSize: RFValue(28),
        fontFamily: 'salsa'
    },

    appTitleTextLight: {
        color: 'black',
        fontSize: RFValue(28),
        fontFamily: 'salsa'
    },

    fieldsContainer: {
        flex: 0.8,
        flexDirection: 'column',
    },

    previewImage: {
        resizeMode: 'contain',
        marginVertical: RFValue(15),
        height: RFValue(200),
        width: '95%',
        borderRadius: RFValue(10),
        alignSelf: 'center',
    },

    inputFont: {
        fontFamily: 'salsa',
        color: 'white',
        height: RFValue(40),
        borderColor: 'white',
        borderWidth: RFValue(1),
        borderRadius: RFValue(15),
        paddingLeft: RFValue(10)
    },
    dropDownPicker: {
        backgroundColor: 'transparent',
        borderWidth: RFValue(1),
        borderColor: 'white',
    },
    dropDownPickerLight: {
        backgroundColor: 'transparent',
        borderWidth: RFValue(1),
        borderColor: 'black',
    },

    submitButton: {
        borderRadius: RFValue(10),
        justifyContent: 'center',
        backgroundColor: 'white',
        marginTop: RFValue(10),
        alignItems: 'center',
        padding: RFValue(10),
    },

    submitText: {
        color: 'black',
        fontFamily: 'salsa',
        fontSize: RFValue(20)
    },
})