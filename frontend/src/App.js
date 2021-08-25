import React, { setState } from 'react';
import './App.css';
import Display from './Display';
import Settings from './Settings';
import axios from 'axios';
import DataProvider from './DataProvider';

async function getCalendar(calendarid, pin) {
    let packet = {calendarid: calendarid, pin:pin}
    return await axios.post("/get_calendar", packet)
    .then((response) => { return response.data })
}

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = { calendarid: '', 
            pin: '', 
            previousCalendar: '',
            data: null, 
            mode: "display",
            w: window.screen.width, 
            h: window.screen.height,
            orientation: (window.innerWidth > window.innerHeight) ? "landscape" : "portrait" 
        }
        this.data = new DataProvider();
        this.setScreenOrientation = this.setScreenOrientation.bind(this);
        this.setCalendar = this.setCalendar.bind(this);
        // this.handleChange = this.handleChange.bind(this);
    }

    setScreenOrientation() {
        this.setState({
            w: window.screen.width, 
            h: window.screen.height,
            orientation: (window.innerWidth > window.innerHeight) ? "landscape" : "portrait" 
        })
    }

    componentDidMount() {
        window.addEventListener("resize", () => this.setScreenOrientation());
        this.ticktocker = setInterval(()=>{
            getCalendar(this.state.calendarid, this.state.pin)
            .then((res) => {
                if (res && res['data']) {
                    this.setState({data: res['data'], previousCalendar: this.state.calendarid});
                }
            })
        }, 3600000); // Every hour query the server for updates
    }

    componentWillUnmount() {
        clearInterval(this.ticktocker);
    }

    componentDidUpdate() {
        // Load the requested calendar
        if (this.state.calendarid !== '' && this.state.pin !== '' && 
            (this.state.calendarid !== this.state.previousCalendar || this.state.previousCalendar === '')) 
            {
            getCalendar(this.state.calendarid, this.state.pin)
            .then((res) => {
                if (res && res['data']) {
                    this.setState({data: res['data'], previousCalendar: this.state.calendarid});
                }
            })
        }
        // Organise the data to display
    }

    setCalendar(calendarid, pin) {
        this.setState({calendarid: calendarid, pin: pin, previousCalendar:''});
    }

    /*
    this.state.data is an array of these.....
        {
            finish-utc-string: "2021-08-25 08:25"
            finish-utc-timestamp: 1629851100
            label: "12X2"
            start-utc-string: "2021-08-25 08:15"
            start-utc-timestamp: 1629850500
            summary: "12X2"
        }
    */
    
    render() {
        console.log(this.state.calendarid);
        if (this.state.calendarid === '') {
            return ( <Settings setCalendar={this.setCalendar}/> )
        } else if (this.state.mode === "display" && this.state.orientation === "landscape") {
            return ( <Display mode="landscape" items={this.state.data} /> );
        } else if (this.state.mode === "display" && this.state.orientation === "portrait") {
            return ( <Display mode="portrait" items={this.state.data} /> )
        } else {
            return ( <Settings setCalendar={this.setCalendar}/> )
        }
    }
}

export default App;
