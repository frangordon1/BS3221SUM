import sql from 'mssql';

let database = null;

export default class Database {
  config = {};
  poolconnection = null;
  connected = false;

  constructor(config) {
    this.config = config;
  }

  async connect() {
    //connecting to the database
    try {
      this.poolconnection = await sql.connect(this.config);
      this.connected = true;
      console.log('Database connected successfully.');
      return this.poolconnection;
    } catch (error) {
      console.error('Error connecting to the database:', error);
      this.connected = false;
    }
  }

  async disconnect() {
    //disconnecting from the database
    try {
      if (this.connected) {
        await this.poolconnection.close();
        this.connected = false;
        console.log('Database disconnected successfully.');
      }
    } catch (error) {
      console.error('Error disconnecting from the database:', error);
    }
  }

  async executeQuery(query) {
    const request = this.poolconnection.request();
    const result = await request.query(query);

    return result.rowsAffected[0];
  }

  async create(data) {
    //creating a new data row in the Wardens table
    const request = this.poolconnection.request();

    request.input('firstName', sql.NVarChar(255), data.firstName);
    request.input('lastName', sql.NVarChar(255), data.lastName);
    request.input('workingLocation', sql.NVarChar(255), data.lastName);

    const result = await request.query(
      `INSERT INTO Wardens (firstName, lastName, workingLocation) VALUES (@firstName, @lastName, @workingLocation)`
    );

    return result.rowsAffected[0];
  }

  async readAll() {
    //retrieving all data from the Wardens table
    const request = this.poolconnection.request();
    const result = await request.query(`SELECT * FROM Wardens`);

    return result.recordsets[0];
  }

  async read(id) {
    //id number for each Wardens
    const request = this.poolconnection.request();
    const result = await request
      .input('id', sql.Int, +id)
      .query(`SELECT * FROM Wardens WHERE id = @id`);

    return result.recordset[0];
  }

  async update(id, data) {
    //updates data for a specific id
    const request = this.poolconnection.request();

    request.input('id', sql.Int, +id);
    request.input('firstName', sql.NVarChar(255), data.firstName);
    request.input('lastName', sql.NVarChar(255), data.lastName);
    request.input('workingLocation', sql.NVarChar(255), data.workingLocation);

    const result = await request.query(
      `UPDATE Wardens SET firstName=@firstName, lastName=@lastName, workingLocation=@workingLocation WHERE id = @id`
    );

    return result.rowsAffected[0];
  }

  async delete(id) {
    //delete the dataassociated with this id number
    const idAsNumber = Number(id);

    const request = this.poolconnection.request();
    const result = await request
      .input('id', sql.Int, idAsNumber)
      .query(`DELETE FROM Wardns WHERE id = @id`);

    return result.rowsAffected[0];
  }

  async createTable() {
    try {
      this.executeQuery(
        `IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Wardens')
          BEGIN
            CREATE TABLE Wardens (
              id INT NOT NULL IDENTITY PRIMARY KEY,
              firstName NVARCHAR(255), 
              lastName NVARCHAR(255),
              workingLocation NVARCHAR(255)
            );
          END`
      )
      console.log('Table created');
    } catch {          // Table may already exist
      console.error(`Error creating table: ${err}`);
    }
  }
}

export const createDatabaseConnection = async (passwordConfig) => {
  database = new Database(passwordConfig);
  await database.connect();
  await database.createTable();
  return database;
};