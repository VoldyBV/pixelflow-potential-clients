import IClientDocument from "../models/clientDocument.interface";

const GET_DOCS = `https://eu-central-1.aws.data.mongodb-api.com/app/data-ukvgc/endpoint/data/v1/action/find`
const INSERT_DOC = `https://eu-central-1.aws.data.mongodb-api.com/app/data-ukvgc/endpoint/data/v1/action/insertOne`
const UPDATE_DOC = `https://eu-central-1.aws.data.mongodb-api.com/app/data-ukvgc/endpoint/data/v1/action/updateOne`
const DELETE_DOC = `https://eu-central-1.aws.data.mongodb-api.com/app/data-ukvgc/endpoint/data/v1/action/deleteOne`

const getDocuments = async () => {
    var result: IClientDocument[] = [];
    try{
        const bearer = sessionStorage.getItem("key")!;
        
        const headers = {
            'Content-Type': 'application/json',
            'Access-Control-Request-Headers': '*',
            'Authorization': `Bearer ${bearer}`
        }
        const body = JSON.stringify({
            'collection': 'clients',
            'database': 'potential-clients-db',
            'dataSource': 'PixelFlowCloud'
        })
        var response = await fetch(GET_DOCS, {
            method: 'POST',
            headers,
            body
        });
        
        result = (await response.json() as any).documents;
        
    }
    catch(error){
        console.error(error);
        result = [];
    }
    finally {
        return result;
    }
}
//inserts document into database. Returns inserted document _id
const insertDocument = async (doc: IClientDocument) => {
    var insertedID: string = "";
    
    try{
        const bearer = sessionStorage.getItem("key")!;
        
        const headers = {
            'Content-Type': 'application/json',
            'Access-Control-Request-Headers': '*',
            'Authorization': `Bearer ${bearer}`
        }
        const body = JSON.stringify({
            'collection': 'clients',
            'database': 'potential-clients-db',
            'dataSource': 'PixelFlowCloud',
            'document': doc
        })
        var response = await fetch(INSERT_DOC, {
            method: 'POST',
            headers,
            body
        });
        if(!response.ok) throw `HTTP error: ${response.status}`;
        insertedID = (await response.json() as any).insertedId as string;
        
    }
    catch(error){
        console.error(error);
        insertedID = '';
    }
    finally {
        return insertedID;
    }
}
//updates existing document. Returns true/false if operation has succeded/failed
const updateDocument = async (doc: IClientDocument) => {
    var isUpdated: boolean = true;
    
    try{
        const bearer = sessionStorage.getItem("key")!;
        
        const headers = {
            'Content-Type': 'application/ejson',
            'Access-Control-Request-Headers': '*',
            'Authorization': `Bearer ${bearer}`
        }
        const body = JSON.stringify({
            'collection': 'clients',
            'database': 'potential-clients-db',
            'dataSource': 'PixelFlowCloud',
            'filter': {
                '_id': {
                    '$oid': doc._id as string
                }
            },
            'update': {
                '$set': {
                    'email': doc.email,
                    'company': doc.company,
                    'full_name': doc.full_name,
                    'website': doc.website,
                    'notes': doc.notes,
                    'sent_emails': doc.sent_emails
                }
            }
        })
        var response = await fetch(UPDATE_DOC, {
            method: 'POST',
            headers,
            body
        });
        isUpdated = response.ok;
        if(!response.ok) throw `HTTP error: ${response.status}`;
        
    }
    catch(error){
        console.error(error);
        isUpdated = false;
    }
    finally {
        return isUpdated;
    }
}
//inserts document into database. Returns inserted document _id
const deleteDocument = async (doc: IClientDocument) => {
    var isDeleted: boolean = true;
    
    try{
        const bearer = sessionStorage.getItem("key")!;
        
        const headers = {
            'Content-Type': 'application/ejson',
            'Access-Control-Request-Headers': '*',
            'Authorization': `Bearer ${bearer}`
        }
        const body = JSON.stringify({
            'collection': 'clients',
            'database': 'potential-clients-db',
            'dataSource': 'PixelFlowCloud',
            'filter': {
                '_id': {
                    '$oid': doc._id as string
                }
            }
        })
        var response = await fetch(DELETE_DOC, {
            method: 'POST',
            headers,
            body
        });
        isDeleted = response.ok;
        if(!response.ok) throw `HTTP error: ${response.status}`;
        
    }
    catch(error){
        console.error(error);
        isDeleted = false;
    }
    finally {
        return isDeleted;
    }
}

export default {
    getDocuments,
    insertDocument,
    updateDocument,
    deleteDocument
}