import { Platform } from 'react-native'

export const COLORS = {
    PRIMARY: '#0e0e0e',
    WHITE: '#FFFFFF',
    WHITE_OPACITY_75: 'rgba(255,255,255,0.75)',
    BLACK: '#000000',
    BLACK_OPACITY_25: 'rgba(0,0,0,0.25)',
    BLACK_OPACITY_50: 'rgba(0,0,0,0.50)',
    GRAY_20: '#333333',
    GRAY: '#CCCCCC',
    GRAY_OPACITY_25: 'rgba(204,204,204,0.25)',
    THEME_OPACITY_25: 'rgba(102,189,76,0.25)',
    THEME_OPACITY_50: 'rgba(102,189,76,0.50)',
    LIGHT_GRAY: '#EEEEEE',
    THEME: '#66bd4c',
    RED: 'red',
    GREEN: 'green',
    YELLOW: '#F0AD4E',
    NEWSFEED_BG: '#D1D1D1'
}

export const COMMON_STYLE = {
    PADDING: 15
}

export default {
    zg: {
        regular: {
            fontSize: 16,
            fontFamily: "Zawgyi-One",
            lineHeight: (Platform.OS == "ios"? 34: 28)
        },
        bold: {
            fontSize: 16,
            fontFamily: "Zawgyi-One",
            lineHeight: (Platform.OS == "ios"? 38: 30)
        },
        input: {
            fontSize: 16,
            fontFamily: "Zawgyi-One",
            lineHeight: (Platform.OS == "ios"? 26: 26)
        }
    },
    mm: {
        regular: {
            fontSize: 18,
            // fontFamily: "Pyidaungsu",
            fontFamily: (Platform.OS == "ios"? "Pyidaungsu": "Pyidaungsu-Regular"),
            lineHeight: (Platform.OS == "ios"? 34: 30)
        },
        bold: {
            fontSize: 18,
            // fontFamily: "Pyidaungsu-Bold",
            fontFamily: "Pyidaungsu-Bold",
            // this is needed for iOS
            fontWeight: (Platform.OS == "ios"? "bold": "normal"),
            lineHeight: (Platform.OS == "ios"? 38: 30)
        },
        input: {
            fontSize: 18,
            // fontFamily: "Pyidaungsu",
            fontFamily: (Platform.OS == "ios"? "Pyidaungsu": "Pyidaungsu-Regular"),
            lineHeight: (Platform.OS == "ios"? 26: 28)
        }
    },
    en: {
        regular: {
            fontSize: 16,
            // fontFamily: "Roboto Mono",
            fontFamily: "RobotoMono-Regular",
            // lineHeight: (Platform.OS == "ios"? 20: 22)
            lineHeight: (Platform.OS == "ios"? 34: 22)
        },
        bold: {
            fontSize: 16,
            // fontFamily: "Roboto Mono",
            fontFamily: "RobotoMono-Bold",
            fontWeight: "bold",
            // lineHeight: (Platform.OS == "ios"? 22: 24)
            lineHeight: (Platform.OS == "ios"? 38: 24)
        },
        input: {
            fontSize: 16,
            // fontFamily: "Roboto Mono",
            fontFamily: "RobotoMono-Regular",
            // lineHeight: (Platform.OS == "ios"? 20: 22)
            lineHeight: (Platform.OS == "ios"? 22: 22)
        }
    },
    CONTAINER_SECTION: {
        backgroundColor: COLORS.WHITE
    },
    SAFE_AREA_SECTION: {
        backgroundColor: COLORS.WHITE
    },
    CONTENT_SECTION_PADDER: {
        paddingLeft: COMMON_STYLE.PADDING,
        paddingRight: COMMON_STYLE.PADDING
    },
    ROUNDED_PRESSABLE_AREA: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center'
    },
    PRIMARY_BUTTON: {
        backgroundColor: COLORS.PRIMARY
    },
    LOGIN_BUTTON: {
        backgroundColor: COLORS.THEME,
        elevation: 0,
        borderWidth: 0,
        borderRadius: 20,
        borderColor: 'transparent'
    },
    GOOGLE_BUTTON: {
        backgroundColor: '#3367D6'
    },
    FACEBOOK_BUTTON: {
        backgroundColor: '#4C69BA',
        color: COLORS.WHITE,
        height: 50,
        borderRadius: 6
    },
    THEME_BUTTON: {
        backgroundColor: COLORS.BLACK,
        color: COLORS.WHITE,
        height: 50,
        borderRadius: 6
    },
    TEXT_HEADING: {
        color: COLORS.BLACK,
        fontSize: 20,
        lineHeight: 55,
        marginBottom: 0,
        paddingBottom: 0,
        textAlign: 'center',
        textAlignVertical: 'center',
        height: 55,
        textTransform: 'uppercase'
    },
    TEXT_HEADING_FORM: {
        color: COLORS.WHITE,
        fontSize: 25,
        marginBottom: 0,
        paddingBottom: 0,
        textAlignVertical: 'center'
    }
}
