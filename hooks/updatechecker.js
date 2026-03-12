import React, { useEffect, useState } from 'react';
import Popup from '../components/popup';
import Constants from 'expo-constants';
import { Linking, useColorScheme } from 'react-native';

const CURRENT_VERSION = Constants.expoConfig?.version ?? '0.0.0';

const UpdateChecker = () => {
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';
    const [showAlert, setShowAlert] = useState(false);
    const [latestVersion, setLatestVersion] = useState(null);

    useEffect(() => {
        fetch('https://api.github.com/repos/AguuZzz/SuperTaTeTi/releases/latest')
            .then(res => res.json())
            .then(data => {
                const remoteVersion = data.tag_name || data.name;
                if (remoteVersion && remoteVersion !== CURRENT_VERSION) {
                    console.log('Update detectado', remoteVersion, CURRENT_VERSION);
                    setLatestVersion(remoteVersion);
                    setShowAlert(true);
                }
            })
            .catch(err => console.log('Error chequeando update', err));
    }, []);

    return (
        <Popup
            show={showAlert}
            title="Actualización disponible"
            message={`Hay una nueva versión disponible${latestVersion ? `: ${latestVersion}` : ''}. Actualiza la aplicación para obtener las últimas funcionalidades.`}
            showConfirmButton={true}
            showCancelButton={true}
            confirmText="Actualizar"
            onConfirmPressed={() => {
                setShowAlert(false);
                Linking.openURL('https://github.com/AguuZzz/SuperTaTeTi/releases/latest');
            }}
            onCancelPressed={() => setShowAlert(false)}
            onClose={() => setShowAlert(false)}
            closeBtn={false}
        />
    );
};

export default UpdateChecker;
