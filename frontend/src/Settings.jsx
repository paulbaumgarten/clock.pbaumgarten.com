import axios from 'axios';
import { useState, useEffect } from 'react';

async function uploadCalendar(file) {
    /* Upload the CSV file via a Form with <input type="file" name="file"> */ 
    let formData = new FormData();
    formData.append("file", file);
    return await axios.post("/set_calendar", formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
    .then((response) => {
        console.log("uploadCalendar res", response);
        return response.data 
    })
}


function Settings({setCalendar}) {
    const [ calendarid, setCalendarid ] = useState('');
    const [ pin, setPin ] = useState('');

    function doUpload(e) {
        let f = document.querySelector("input[name='calendarfile']");
        uploadCalendar(f.files[0])
        .then((result)=>{
            if (result && result['calendarid'] && result['pin'] ) {
                alert("Calendar successfully imported. To access this calendar in the future use\ncalendarid: "+result['calendarid']+"\npin: "+result['pin']+"\n\nPlease record these values.");
                setCalendar(result['calendarid'], result['pin']);
            } else {
                alert("Error importing the calendar")
            }
        })
    }

    function doLoad(e) {
        setCalendar(calendarid, pin);
    }

    return(
        <div>
            <fieldset>
                <legend>Upload new calendar</legend>
                <label for="calendarfile">Upload an .ical file</label>
                <input name="calendarfile" type="file"/>
                <input name="upload" type="button" onClick={(e)=>doUpload()} value="Upload"/>
            </fieldset>
            <div>&nbsp;</div>
            <div>&nbsp;</div>
            <fieldset>
                <legend>Open existing calendar</legend>
                <label for="calendarid">Calendar ID</label>
                <input name="calendarid" type="text" value={calendarid} onChange={(e)=>setCalendarid(e.target.value)}/>
                <label for="calendarid">PIN code</label>
                <input name="pin" type="password" value={pin} onChange={(e)=>setPin(e.target.value)}/>
                <input name="load" type="button" onClick={(e)=>doLoad()} value="Load"/>
            </fieldset>
        </div>
    )
}
export default Settings;

