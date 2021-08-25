import './App.css';
import React, { useEffect, useState } from 'react';

function ShowDate() {
    const [ date, setDate ] = useState("");
    const [ n, setN ] = useState(0);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    useEffect(()=>{
        setTimeout(()=>{
            let t = new Date();
            let display = t.getDate().toPrecision(2) + " " + monthNames[t.getMonth()];
            setDate( display );
            setN( n+1 );
        }, 1000);
    }, []);

    useEffect(()=>{
        setTimeout(()=>{
            let t = new Date();
            let display = t.getDate().toPrecision(2) + " " + monthNames[t.getMonth()];
            setDate( display );
            setN( n+1 );
        }, 60000);
    }, [n]);

    return (
    <div className="date">{date}</div>
    )
}

function convertTimestampToDisplayTime(unix_timestamp) {
    let t = new Date(unix_timestamp * 1000);
    return String(t.getHours()).padStart(2,"0") + ":" + String(t.getMinutes()).padStart(2,"0");
}

class ShowTime extends React.Component{
    constructor(props) {
        super(props);
        this.state = {time: 0};
        this.tick = this.tick.bind(this);
    }
    componentDidMount() {
        this.tick();
    }
    tick() {
        let t = new Date();
        let display = String(t.getHours()).padStart(2,"0") + ":" + String(t.getMinutes()).padStart(2,"0");
        if (t.getSeconds() % 2 == 0) {
            display = String(t.getHours()).padStart(2,"0") + " " + String(t.getMinutes()).padStart(2,"0");
        }
        this.setState({time: display});
    }
    componentDidUpdate() {
        setTimeout(()=>this.tick(), 1000);
    }
    componentWillUnmount() {
    }
    render() {
        if (! this.state.time) return (<div/>)
        return(
            <div className="time">{this.state.time}</div>
        )
    }
}

function CalendarItem({item, mode, now}) {
    let orientation = (mode == "portrait") ? "calendaritem_portrait" : "calendaritem_landscape";
    let start = new Date(item['start-utc-timestamp'] * 1000);
    let finish = new Date(item['finish-utc-timestamp'] * 1000);
    if (now >= start && now <= finish) { // Event is currently in progress
        let minutesRemaining = Math.floor(finish.getTime()/60000 - now.getTime()/60000);
        let bgcolor = "#32a84a"; // green
        if (minutesRemaining <= 5) {
            bgcolor = "#ff0000"; // red
        } else if (minutesRemaining <= 10) {
            bgcolor = "#ff7700" // deep orange 
        } else if (minutesRemaining <= 15) {
            bgcolor = "#ffa600"; // light orange
        }
        return(
            <div className={"calendaritem "+orientation}>
                <div className="calendaritem_name">{item.label}</div>
                <div className="calendaritem_start">{convertTimestampToDisplayTime(item['start-utc-timestamp'])}</div>
                <div className="calendaritem_finish">{convertTimestampToDisplayTime(item['finish-utc-timestamp'])}</div>
                <div className="calendaritem_countdown countdown"  style={{backgroundColor: bgcolor}}>{minutesRemaining}</div>
            </div>
        )
    } else if (now <= start) { // Event has not yet started
        return(
            <div className={"calendaritem "+orientation}>
                <div className="calendaritem_name">{item.label}</div>
                <div className="calendaritem_start">{convertTimestampToDisplayTime(item['start-utc-timestamp'])}</div>
                <div className="calendaritem_finish">{convertTimestampToDisplayTime(item['finish-utc-timestamp'])}</div>
            </div>
        )
    } else { // Event has concluded
        return(<div style={{display:"none"}} />)
    }
}

function CalendarItems({items, mode}) {
    const [ now, setNow ] = useState(new Date());
    useEffect(()=>{
        setTimeout(()=>{
            setNow(new Date())
        }, 1000);
    }, [now]);
    let utc_timestamp = Math.floor((new Date()).getTime() / 1000);
    if (! Array.isArray(items)) {
        return (<div/>)
    }
    return (
    <div className="calendaritems">
        { items.map((v, i)=>{
            // If the finish time is in the future
            if (utc_timestamp < v['finish-utc-timestamp']) {
                // If the start time is less than 24 hours away
                if ((utc_timestamp+24*60*60) > v['start-utc-timestamp']) {
                    return( <CalendarItem key={i} item={v} mode={mode} now={now}/> )
                }
                //if ((utc_timestamp+40*60*60) > v['start-utc-timestamp']) {
                //    console.log((utc_timestamp+24*60*60), v);
                //}
            }
        })}
    </div>
    )
}

class Display extends React.Component {
    constructor(props) {
        super(props);
        this.state = { remaining: 20 };
        //this.ticktock = this.ticktock.bind(this);
    }

    componentDidMount() {
    }

    componentWillUnmount() {
    }

    render() {
        if (this.props.mode==="landscape") {
        return (
            <div className="landscape">
                <ShowDate/>
                <ShowTime/>
                <CalendarItems items={this.props.items} mode="landscape"/>
            </div>
        )
        } else {
        return (
            <div className="portrait">
                <ShowDate/>
                <ShowTime/>
                <CalendarItems items={this.props.items} mode="portrait"/>
            </div>
        )
        }
    }
}

export default Display;
