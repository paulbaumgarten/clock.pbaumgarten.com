from flask import Flask, request, render_template, jsonify
from database import SQLiteDatabase
import logging
import random
import io
from icalendar import Calendar, Event
from datetime import datetime, date
from pprint import pprint
import json

""" Database design

CREATE TABLE "calendar" (
	"calendar_id"	INTEGER PRIMARY KEY AUTOINCREMENT,
	"pin"	TEXT NOT NULL,
	"owner"	TEXT,
	"email"	TEXT,
	"data"	BLOB
);
"""

logging.basicConfig(filename="airportdisplay.log", level=logging.DEBUG)
db_filename = "airportdisplay.db"
app = Flask(__name__)
app.config['SECRET_KEY'] = "skldfjdskrem,3rio32rkewnlfsdncx"

@app.route("/")
def index():
    return render_template("index.html")

def parse_ical(data):
    gcal = Calendar.from_ical(data)
    today = []
    for component in gcal.walk():
        if component.name == "VEVENT":
            event_start = component.get('dtstart').dt
            if isinstance(event_start, datetime):
                if event_start.date() >= datetime.today().date():
                    event = {
                        "summary" : str(component.get('summary')),
                        "start-utc-string" : component.get('dtstart').dt.strftime("%Y-%m-%d %H:%M"),
                        "finish-utc-string" : component.get('dtend').dt.strftime("%Y-%m-%d %H:%M"),
                        "start-utc-timestamp" : component.get('dtstart').dt.timestamp(),
                        "finish-utc-timestamp" : component.get('dtend').dt.timestamp()
                    }
                    label = event['summary']
                    # Only show up to the first space character
                    #if label.count(" ") >= 1:
                    #    label = label.split(" ")[0]
                    # If length is > 20, shorten it
                    if len(label) > 20:
                        label = label[:20]
                    event['label'] = label
                    today.append(event)
    return today

@app.route("/get_calendar", methods=['post'])
def get_calendar():
    print("get_calendar")
    if request.is_json:
        info = dict(request.json)
        if "calendarid" in info and "pin" in info:
            db = SQLiteDatabase(db_filename)
            sql = "SELECT data FROM calendar WHERE calendar_id=? AND pin=?"
            ical_data = db.read(sql, (info['calendarid'], info['pin']))
            if len(ical_data)==1:
                if "data" in ical_data[0]:
                    json_data = parse_ical(ical_data[0]['data'].encode('utf-8'))
                    # Hackery to enable debugging at the wrong time of day
                    #for i in range(len(json_data)):
                    #    json_data[i]['start-utc-timestamp'] = json_data[i]['start-utc-timestamp'] - 12*60*60 + 15*60;
                    #    json_data[i]['finish-utc-timestamp'] = json_data[i]['finish-utc-timestamp'] - 12*60*60 + 15*60;
                    # End of hackery
                    print("returning",len(json_data),"items")
                    return jsonify({"status":"ok", "data": json_data})
                print("error 4")
            print("error 3")
        print("error 2")
    print("error 1")
    return jsonify({"status":"error"})

@app.route("/set_calendar", methods=['post'])
def update_calendar():
    print(request.files)
    ical_file = request.files['file']
    content = ical_file.stream.read().decode("UTF8")
    pin = str(random.randint(0,9999)).ljust(4,'0')
    sql = "INSERT INTO calendar (pin, data) VALUES (?, ?);"
    db = SQLiteDatabase(db_filename)
    ok, id = db.write(sql, (pin, content))
    print(f"[/set_calendar] id: {id} pin: {pin}")
    reply = {"calendarid": id, "pin": pin}
    return jsonify(reply)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port="8080", debug=True)
