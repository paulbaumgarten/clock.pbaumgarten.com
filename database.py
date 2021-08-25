import sqlite3

class SQLiteDatabase:
    def __init__(self, filename):
        self.filename = filename
    
    def open(self):
        self.connection = sqlite3.connect(self.filename)
        self.connection.row_factory = sqlite3.Row
        self.cursor = self.connection.cursor()

    def close(self):
        self.cursor.close()
        self.connection.close()

    def write(self, sql:str, data=None):
        self.open()
        if data:
            rows_affected = self.cursor.execute(sql, data).rowcount
            last_row_id = self.cursor.lastrowid
        else:
            rows_affected = self.cursor.execute(sql).rowcount
            last_row_id = self.cursor.lastrowid
        self.connection.commit()
        self.close()
        return rows_affected, last_row_id

    def read(self, sql:str, data=None):
        self.open()
        if data:
            self.cursor.execute(sql, data)
        else:
            self.cursor.execute(sql)
        records = self.cursor.fetchall()
        rows = [dict(record) for record in records]
        self.close()
        return rows

    def __del__(self):
        pass
