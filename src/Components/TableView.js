import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { DataState } from '../Enums/data-state'
import { Status } from '../Enums/status'
//import { createNotification } from '../Services/NotificationServices'
import { NotificationContainer } from 'react-notifications';

function TableView() {
    const apiUrl = 'http://localhost:8080'

    const [servers, setServers] = useState({ dataState: DataState.LOADING_STATE })
    const [isPing, setIsPing] = useState('')
    const [filter, setFilter] = useState(Status.ALL)
    const [loading, setLoading] = useState(false)

    const {register, handleSubmit, reset} = useForm()

    //fetch servers
    useEffect(() => {
        setServers({ dataState: DataState.LOADING_STATE })
        
        getServers()

    }, [])

    const getServers = () => {
        fetch(`${apiUrl}/server/list`)
            .then((res) => res.json())
            .then((response) => {
                console.log(response.message)
                setServers({
                    dataState: DataState.LOADED_STATE, appData: {
                        ...response, data: {
                            servers: response.data.servers.reverse()
                        }
                    }
                })
                
            })
            .catch((err) => {
                setServers({ dataState: DataState.ERROR_STATE, error: err })
            })
    }
    
    const pingServer = (ip) => {
        setIsPing(ip)
        
        fetch(`${apiUrl}/server/ping/${ip}`)
        .then((res => res.json()))
        .then((response) => {
            console.log(response.message)
            
            setServers(prev => ({
                ...prev,
                appData: {
                    ...prev.appData,
                    data: prev.appData.data.servers?.map(srv => {
                        return srv.ipAddress === ip ? {...srv, id:srv.id++, status: response.data?.server.status} 
                        : {...srv, id: srv.id++}
                    })
                }
            }))
            const updateServers = servers;
            setIsPing('')
            setServers(updateServers)//used because of re-rendering error from React
        })
    }

    const saveForm = (data) => {
        
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: data
        }

        setLoading(true)

        fetch(`${apiUrl}/server/save`, requestOptions)
        .then(res => {
            if(res.ok) return res.json()

            setLoading(false)
            throw new Error('Something went wrong.. ')
        })
        .then(response => {
            console.log(response)
            setServers(prev => ({
                ...prev,
                appData: {
                    ...prev.appData,
                    data: {servers: [response.data?.server, ...prev.appData.data.servers]}
                }
            }))
            console.log(response.message)
            document.getElementById('closeModal')?.click();
            reset()
            setLoading(false)
        })
        .catch(err => console.log(err.message))
    }

    const deleteServer = (id) => {
        const requestOptions = {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: id
        }

        fetch(`${apiUrl}/server/delete/${id}`, requestOptions)
        .then(res => {
            if(res.ok) return res.json()
            throw new Error('Something went wrong.. ')
        })
        .then(response => {
            console.log(response.message)
            getServers()
        })
        .catch(err => console.log(err.message))
    }

    const printReport = () => {
        let dataType = 'application/vnd.ms-excel.sheet.macroEnabled.12'
        let tableSelect = document.getElementById('servers')
        let tableHtml = tableSelect?.outerHTML.replace(/ /g, '%20')
        let downloadLink = document.createElement('a')
        document.body.appendChild(downloadLink)
        downloadLink.href = 'data:' + dataType + ', ' + tableHtml
        downloadLink.download = 'server-report.xls'
        downloadLink.click()
        document.body.removeChild(downloadLink)
    }

    return (
        <>
            <div className="container-xl">
                <div className="table-responsive">
                    <div className="table-wrapper">
                        <div className="table-title">
                            <div className="row">
                                <div className="col-sm-6">
                                    <h2>Manage Servers</h2>
                                </div>
                                <div className="col-sm-6">
                                    <button type="button" onClick={() => printReport()} className="btn btn-primary">Print Report</button>

                                    <a href="#addEmployeeModal" className="btn btn-success" data-toggle="modal">
                                        <i className="material-icons">&#xE147;</i>
                                        <span>New Server</span>
                                    </a>

                                    <span>
                                        <select name="status" onChange={(e) => setFilter(e.target.value)} className="btn btn-info"
                                            style={{height: '32.91px'}}>
                                            <option value={Status.ALL}>ALL</option>
                                            <option value={Status.SERVER_UP}>SERVER UP</option>
                                            <option value={Status.SERVER_DOWN}>SERVER DOWN</option>
                                        </select>
                                    </span>
                                </div>
                            </div>
                        </div > <br />

                    {servers.dataState === DataState.LOADING_STATE &&
                        <div className="col-md-12 single-note-item text-center">
                            <div className="spinner-border text-info" role="status"></div>
                        </div>
                    }
                    {servers.dataState === DataState.LOADED_STATE &&
                        <table className="table table-striped table-hover" id="servers">
                            <thead>
                                <tr>
                                    <th>Nr</th>
                                    <th>Image</th>
                                    <th>IP Address</th>
                                    <th>Name</th>
                                    <th>Memory</th>
                                    <th>Type</th>
                                    <th>Status</th>
                                    <th>Ping</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {servers.appData.data.servers?.map((server, index) => {
                                if(filter !== Status.ALL && server.status !== filter) return null
                                return(
                                    
                                <tr key={server.id}>
                                    <td className="badge">{index + 1}</td>
                                    <td><img width="40" src={server.imageUrl} height="40" alt={server.name} /></td>
                                    <td>{server.ipAddress}</td>
                                    <td>{server.name}</td>
                                    <td>{server.memory}</td>
                                    <td>{server.type}</td>
                                    <td>
                                        <span 
                                        className = {server.status === Status.SERVER_UP ?  'badge-success' :  'badge-danger'}
                                        >
                                        {server.status === Status.SERVER_UP ? 'RUNNING' : ' SERVER DOWN'}
                                        </span>
                                    </td>
                                    <td>
                                        <a href='##' onClick={() => pingServer(server.ipAddress)} style={{cursor: 'pointer'}}>
                                            {(isPing !== '' || isPing !== server.ipAddress) &&
                                                <i className="material-icons" title="Ping server">&#xe328;</i>
                                            }
                                            {isPing === server.ipAddress &&
                                                <i className="fa fa-spinner fa-spin" style={{fontSize:"24px"}}></i>
                                            }
                                        </a >
                                    </td >
                                    <td>
                                        <a className="delete" data-toggle="modal" href="##" style={{ cursor: 'pointer' }}><i
                                        onClick={() => deleteServer(server.id)}  className="material-icons" data-toggle="tooltip" title="Delete">&#xE872;</i></a>
                                    </td >
                                </tr>
                                )
                                })//end foreach server
                                }
                            </tbody >
                        </table >
                        }
                        {servers.dataState === DataState.ERROR_STATE &&
                        <div className="alert-danger">
                            {servers.error}
                        </div>
                        }
                    </div >
                </div >
            </div >


            <div id="addEmployeeModal" className="modal fade">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <form onSubmit={handleSubmit(data => saveForm(JSON.stringify(data)))}>
                            <div className="modal-header">
                                <h4 className="modal-title">Add Server</h4>
                                <button type="button" className="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>IP</label>
                                    <input {...register("ipAddress")} type="text" name="ipAddress" className="form-control" required />
                                </div>
                                <div className="form-group">
                                    <label>Name</label>
                                    <input type="text" {...register("name")} name="name" className="form-control" required />
                                </div>
                                <div className="row">
                                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-6">
                                        <div className="form-group">
                                            <label>Memory</label>
                                            <input type="text" {...register("memory")} name="memory" className="form-control" required />
                                        </div>
                                    </div>
                                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-6">
                                        <div className="form-group">
                                            <label>Type</label>
                                            <input type="text" {...register("type")} name="type" className="form-control" required />
                                        </div>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Status</label>
                                    <select name="status" {...register("status")}  className="form-control" required>
                                        <option value="SERVER_UP">SERVER UP</option>
                                        <option value="SERVER_DOWN">SERVER DOWN</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-warning" id="closeModal" data-dismiss="modal">
                                    Cancel
                                </button>
                                <button type="submit" disabled={loading} className="btn btn-success">
                                    {loading && <i className="fas fa-spinner fa-spin"></i>}
                                    {loading && <span >Saving...</span>}
                                    {!loading && <span >Add</span>}
                                </button>
                            </div >
                        </form >
                    </div >
                </div >
            </div >
            <NotificationContainer />
        </>
    )
}

export default TableView