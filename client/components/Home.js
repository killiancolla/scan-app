import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, FlatList, TouchableOpacity, Image } from 'react-native';
import { Camera } from 'expo-camera';
import { BarCodeScanner } from 'expo-barcode-scanner';
import axios from 'axios';
import Constants from 'expo-constants';

export default function Home({ navigation }) {
    const [hasPermission, setHasPermission] = useState(null);
    const [users, setUsers] = useState([])
    const [openCam, setOpenCam] = useState(false)

    useEffect(() => {
        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
            const response = await axios.get(`http://${Constants.manifest.IP_ADDRESS}:3001/users`)
            let data = response.data
            setUsers(data)
        })();
    }, []);

    const handleBarCodeScanned = ({ data }) => {
        setOpenCam(false);
        const allData = async () => {
            try {
                const response = await axios.get(data)
                const finalData = response.data

                let formData = {
                    gender: finalData.results[0].gender,
                    firstname: finalData.results[0].name.first,
                    lastname: finalData.results[0].name.last,
                    email: finalData.results[0].email,
                    coordinates: finalData.results[0].location.coordinates,
                    city: finalData.results[0].location.city,
                    country: finalData.results[0].location.country,
                    avatar: finalData.results[0].picture.large
                }

                const responsePost = await axios.post(`http://${Constants.manifest.IP_ADDRESS}:3001/users`, formData);
                setUsers(responsePost.data)
            } catch (error) {
                console.error('Error:', error);
            }
        }
        allData()
    };

    const renderItem = ({ item }) => {
        return (
            <TouchableOpacity onPress={(e) => navigation.navigate('Details', { id: item.id })}>
                <View style={styles.row}>
                    <Image source={{ uri: item.avatar }} style={styles.pic} />
                    <View>
                        <View style={styles.nameContainer}>
                            <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
                                {item.firstname}
                            </Text>
                            <Text style={styles.gender}>{item.gender}</Text>
                        </View>
                        <View style={styles.countryContainer}>
                            <Text style={styles.country}>{item.country}</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }

    if (hasPermission === null) {
        return <Text>Demande d'autorisation de la caméra...</Text>;
    }
    if (hasPermission === false) {
        return <Text>Pas d'accès à la caméra</Text>;
    }

    console.log(users);

    return (
        <View style={{ flex: 1 }}>
            {openCam && (
                <>
                    <Button title='Fermer la caméra' onPress={(e) => setOpenCam(false)} />
                    <Camera
                        style={styles.camera}
                        type={Camera.Constants.Type.back}
                        onBarCodeScanned={handleBarCodeScanned}
                    />
                </>
            )}
            {!openCam && (
                <>
                    <Button title='Scanner un QR Code' onPress={(e) => setOpenCam(true)} />
                    <FlatList
                        data={users}
                        keyExtractor={item => {
                            return item.id
                        }}
                        renderItem={renderItem}
                    />
                </>
            )}
            <StatusBar style="auto" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    camera: {
        flex: 1,
        width: '100%',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    scanText: {
        color: '#fff',
        fontSize: 18,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: '#DCDCDC',
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        padding: 10,
    },
    pic: {
        borderRadius: 30,
        width: 60,
        height: 60,
    },
    nameContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: 280,
    },
    name: {
        marginLeft: 15,
        fontWeight: '600',
        color: '#222',
        fontSize: 18,
        width: 170,
    },
    gender: {
        fontWeight: '200',
        color: '#777',
        fontSize: 13,
    },
    countryContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    country: {
        fontWeight: '400',
        color: '#008B8B',
        fontSize: 12,
        marginLeft: 15,
    },
});
