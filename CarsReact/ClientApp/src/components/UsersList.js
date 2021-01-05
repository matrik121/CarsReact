import React, {Component} from 'react';
import {VehiclesList} from "./VehiclesList";

export class UsersList extends Component {
    displayName = UsersList.name

    constructor(props) {
        super(props);
        this.state = {usersstore: null, loading: true};

        fetch('api/Data/GetUsersStore')
            .then(response => response.json())
            .then(data => {
                this.setState(
                    {
                        usersstore: data,
                        loading: false,
                        page: 0,
                        user : null
                    });
            });
        this.userSelect = this.userSelect.bind(this);
        this.backCallBack = this.backCallBack.bind(this);
    }

    renderPageContent() {
        if (this.state.page === 2 && this.state.loading === false) {
            return <VehiclesList user={this.state.user} back={this.backCallBack}/>
        }

        return this.state.loading
            ? <p><em>Loading...</em></p>
            :<div>
                <h1>Users list</h1>    
            <table className='table'>
                <thead>
                <tr>
                    <th>Photo</th>
                    <th>Name</th>
                    <th>Surname</th>
                    <th>Vehicles count</th>
                </tr>
                </thead>
                <tbody>
                {this.state.usersstore.data.map(user => {
                        if (user.owner != null)
                            return <tr key={user.userid}>
                                <td><img alt={user.owner.surname} src={user.owner.foto} width="100" height="100"/></td>
                                <td>{user.owner.name}</td>
                                <td>{user.owner.surname}</td>
                                <td>{user.vehicles.length}</td>
                                <td>
                                    <input type="button" value="Select" onClick={() => this.userSelect(user)}/>
                                </td>
                            </tr>
                    }
                )}
                </tbody>
            </table>
            </div>;
    }

    userSelect(user) {
        this.setState({ page: 2, user : user});
    }

    backCallBack() {
        this.setState({ page: 0, user : null});
    }

    render() {
        return (
            <div>
                {this.renderPageContent()}
            </div>
        );
    }
}
