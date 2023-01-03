import { Dimensions } from 'react-native'
import Bottombar from "../bottombar/en"

const { width } = Dimensions.get('window')

let options = {
    sideMenu: {
        openGestureMode: 'bezel',
        left: {
            width: width <= 360? (width - 30): (width - 50)
        }
    }
}

export default {
    left: {
        stack: {
            id: "LEFT_STACK",
            children: [
                {
                    component: {
                        name: "sidebar.panntheefoundation.Left",
                        options: {
                            topBar: {
                                height: 0,
                                visible: false
                            },
                            sideMenu: {
                                openGestureMode: 'bezel',
                                left: {
                                    width: width <= 360? (width - 30): (width - 50)
                                }
                            }
                        }
                    }
                }
            ]
        }
    },
    center: {
        bottomTabs: {
            id: "BOTTOM_TABS_LAYOUT",
            children: Bottombar
        }
    },
    options: options
}