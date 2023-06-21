import { useEffect, useState } from "react"
import { Text, View, Image, StyleSheet, Button, Modal, Pressable, TextInput, Alert } from "react-native"
import axios from "axios";
import MapView, { Marker } from 'react-native-maps';
import * as Calendar from 'expo-calendar';
import Constants from 'expo-constants';

export default function Details({ navigation, route }) {

    const id = route.params.id

    const [user, setUser] = useState('')
    const [visible, setVisible] = useState(false)
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')

    useEffect(() => {
        const getUser = async () => {
            const response = await axios.get(`http://${Constants.manifest.IP_ADDRESS}:3001/users/${id}`)
            let data = response.data
            setUser(data)
        }
        getUser();
    }, [])

    const handleAddEvent = async () => {
        const { status } = await Calendar.requestCalendarPermissionsAsync();
        if (status === 'granted') {
            const defaultCalendar = Platform.OS === 'ios' ?
                await Calendar.getDefaultCalendarAsync() :
                { id: (await Calendar.getCalendarsAsync())[0].id };
            const event = {
                title: 'Rendez-vous avec ' + user.firstname + ' ' + user.lastname,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                timeZone: 'GMT',
                location: '',
                alarms: [{
                    relativeOffset: -30,
                    method: Calendar.AlarmMethod.ALERT,
                }],
            };

            const eventId = await Calendar.createEventAsync(defaultCalendar.id, event);

            if (eventId) {
                Alert.alert('Succès', 'Événement ajouté à l\'agenda !');
                setStartDate('');
                setEndDate('');
                setVisible(false)
            } else {
                Alert.alert('Erreur');
            }
        } else {
            Alert.alert('Permissions refusées');
        }
    };

    return (
        <>
            {user && (
                <View style={styles.container}>
                    <Image source={{ uri: user.avatar }} style={styles.image} />
                    <Text style={styles.text}>{user.firstname} {user.lastname}</Text>
                    <Text style={styles.text}>{user.email}</Text>
                    <View style={styles.mapContainer}>
                        <MapView
                            style={styles.map}
                            initialRegion={{
                                latitude: user.coordinates.latitude,
                                longitude: user.coordinates.longitude,
                                latitudeDelta: 0.0922,
                                longitudeDelta: 0.0421
                            }}
                        >
                            <Marker
                                coordinate={{
                                    latitude: user.coordinates.latitude,
                                    longitude: user.coordinates.longitude
                                }}
                                title="Votre position"
                            />
                        </MapView>
                    </View>
                    <Button style={styles.button} title="Ajouter un rendez-vous" onPress={(e) => setVisible(true)} />
                    <Modal visible={visible} animationType='fade'>
                        <View style={styles.formContainer}>
                            <Text style={styles.text}>Ajouter un rendez-vous</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Date de début (YYYY-MM-DD)"
                                placeholderTextColor='grey'
                                value={startDate}
                                onChangeText={setStartDate}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Date de fin (YYYY-MM-DD)"
                                placeholderTextColor='grey'
                                value={endDate}
                                onChangeText={setEndDate}
                            />
                            <Button
                                style={styles.button}
                                title="Ajouter l'événement à l'agenda"
                                onPress={handleAddEvent}
                            />
                            <Pressable onPress={(e) => setVisible(false)}>
                                <Text>Fermer</Text>
                            </Pressable>
                        </View>
                    </Modal>
                </View>
            )
            }
        </>
    )

}

const styles = StyleSheet.create({
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
    formContainer: {
        flex: 1,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    input: {
        width: '100%',
        height: 40,
        borderColor: '#333',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 20,
        paddingLeft: 10,
    },
    // button: {
    //     marginTop: 10,
    // },
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,  // Ajoute un espace tout autour du contenu
    },
    image: {
        width: 200,
        height: 200,
        borderRadius: 100,
        marginBottom: 20,
    },
    text: {
        fontSize: 18,
        color: '#333',
        marginBottom: 10,
    },
    mapContainer: {
        flex: 1,
        width: '100%',
        marginBottom: 20,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    button: {
        backgroundColor: "#841584",  // Couleur du fond du bouton
        color: "#fff",  // Couleur du texte du bouton
        padding: 10,  // Ajoute un espace tout autour du texte du bouton
        borderRadius: 5,  // Arrondit les coins du bouton
        textAlign: 'center',  // Centre le texte du bouton
    },

});
