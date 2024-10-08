import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Liste.css'

const Liste = () => {
    const [columns, setColumns] = useState([]);
    const [data, setData] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(2);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const token = localStorage.getItem('token');

   const getFirstStringOfObject = ( object, cols ) => {
       for (let i = 0; i < cols.length; i++ ){
           if( typeof object[cols[i]] === 'string' ){
               return object[cols[i]];
           }
       }
       return object[cols[0]];
   };

   const handleLogout = () => {
    
    localStorage.setItem('token', '');
    window.location.href = "/";
};

    const fetchItems = (page = 0, size = 2) => {
        let url = `http://localhost:8080/employes?page=${page}&size=${size}`;
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    let response = JSON.parse(this.response);
                    if (response.content && response.content.length > 0) {
                        const objectKeys = Object.keys(response.content[0]);
                        setColumns(objectKeys);
                        for( let i = 0; i < response.content.length ; i++ ){
                            let data0 = response.content[i];
                            for( let keys of objectKeys ){
                                if( typeof data0[keys] === 'object' ){
                                    data0[keys] = getFirstStringOfObject( data0[keys], Object.keys(data0[keys]) );
                                }else{
                                    data0[keys] = data0[keys];
                                }
                            }
                            response.content[i] = data0;
                        }
                        setData(response.content);
                        setTotalElements(response.totalElements);
                        setTotalPages(response.totalPages);
                    }
                }
            }
        };
        xhttp.open("GET", url, true);
        if(token){
            xhttp.setRequestHeader('Authorization', `Bearer ${token}`)
            xhttp.setRequestHeader('Content-Type', 'application/json')
        }
        xhttp.send(null);
    };

    const deleteProducts = ( id ) => {
    let url = "http://localhost:8080/employes/" + id;
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if( this.readyState === 4 ){
        if( this.status === 200 ){
              fetchItems();
              console.log("Ok delete");
        }else{
            const errorResponse = JSON.parse(this.response);
            console.error(`Erreur lors de la suppression : ${errorResponse.erreur}`);
        }
        
      }
    };
    xhttp.open( "DELETE" , url , true );
    if(token){
            xhttp.setRequestHeader('Authorization', `Bearer ${token}`)
            xhttp.setRequestHeader('Content-Type', 'application/json')
        }
    xhttp.send(null);
  };

    useEffect(() => {
        fetchItems(currentPage, pageSize);
    }, [currentPage, pageSize]);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const handlePageSizeChange = (newSize) => {
        setPageSize(newSize);
    };

    return (
      <div>
      <Link to="/insert">Ajouter</Link>
      <button onClick={() => handleLogout()}>Deconnecter</button>
        <table>
            <thead>
                <tr>
                    {columns.map((column) => (
                        <th key={column}>{column}</th>
                    ))}
                    <th></th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {data.map((row, index) => (
                    <tr key={index}>
                        {columns.map((column) => (
                            <td key={column}>{row[column]}</td>
                        ))}
                        <td><Link to={"/update/"+row["id"]}>Modifier</Link></td>
                        <td><button onClick={ () => deleteProducts( row["id"] ) }> Supprimer </button></td>
                    </tr>
                    ))}
            </tbody>
        </table>
        <div>
            Page {currentPage + 1} of {totalPages}
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 0}>Previous</button>
            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages - 1}>Next</button>
        </div>
      </div>
    );
};

export default Liste;
