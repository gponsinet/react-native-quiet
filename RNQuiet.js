import Quiet from 'quietjs-bundle'
import { NativeEventEmitter, NativeModules, Platform } from 'react-native'

if (Platform.OS === 'web') {
	let FRAME_TRANSMITTER = null
	let FRAME_RECEIVER = null

	const RNQuiet = {
		async start(pKey) {
			Quiet.init({
				profilesPrefix: '/',
				memoryInitializerPrefix: '/',
				libfecPrefix: '/',
			})

			// Place the beacon back into the initial state.
			RNQuiet.stop()
			try {
				FRAME_TRANSMITTER = Quiet.transmitter({
					profile: pKey,
					onFinish: () => console.log('transmitted'),
				})
				FRAME_RECEIVER = Quiet.receiver({
					profile: pKey,
					onReceive(buf) {
						new NativeEventEmitter(RNQuiet).emit(
							'onMessageReceived',
							Quiet.ab2str(buf),
						)
					},
					onCreateFail(message) {
						throw new Error(message)
					},
					onReceiveFail(message) {
						throw new Error(message)
					},
				})
			} catch (err) {
				console.error(err)
				RNQuiet.stop()
			}
		},
		send(pMessage) {
			try {
				if (FRAME_TRANSMITTER != null) {
					// Transmit the message.
					FRAME_TRANSMITTER.transmit(Quiet.str2ab(pMessage))
				}
			} catch (err) {
				console.error(err)
			}
		},
		stop() {
			FRAME_RECEIVER = null
			FRAME_TRANSMITTER = null
		},
	}

	Quiet.addReadyCallback(
		() => {},
		(message) => {
			throw new Error(message)
		},
	)
	NativeModules.RNQuiet = RNQuiet
}
