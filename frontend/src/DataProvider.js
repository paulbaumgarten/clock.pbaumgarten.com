import axios from 'axios';

class DataProvider {
    constructor() {
        this.url = ""; // Not needed for now.
    }

    async getCalendar(calendarid, pin) {
        let packet = {calendarid: calendarid, pin:pin}
        return await axios.post(this.url+"/get_calendar", packet)
        .then((response) => { return response.data })
    }

    async setCalendar(calendarid, pin, file) {
        let packet = {calendarid: calendarid, pin:pin}
        /* Upload the file via a Form with <input type="file" name="file"> */ 
        let formData = new FormData();
        formData.append("file", file);
        formData.append("calendarid", calendarid);
        formData.append("pin", pin);
        return await axios.post(this.url+"/set_calendar", formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
        })
        .then((response) => {
            console.log("DataProvider/setCalendar res", response);
            return response.data 
        })
    }
}

export default DataProvider;

