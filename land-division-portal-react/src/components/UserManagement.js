import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebase';
import { ROLES } from '../utils/roles';
import { toaster } from './ui/toaster';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Helper function to extract the actual role value
    const getRoleValue = (roleData) => {
        if (typeof roleData === 'string') return roleData;
        if (roleData?.value?.[0]) return roleData.value[0];
        if (roleData?.items?.[0]?.value) return roleData.items[0].value;
        return ROLES.USER;
    };

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const usersSnapshot = await db.collection('users').get();
                const usersData = usersSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setUsers(usersData);
            } catch (error) {
                console.error("Error fetching users:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const handleRoleChange = async (userId, event) => {
        const newRole = event.target.value;
        try {
            // Update with just the string value
            await db.collection('users').doc(userId).update({
                role: newRole
            });
            setUsers(users.map(user => 
                user.id === userId ? { ...user, role: newRole } : user
            ));
            toaster.success({
                title: "Role updated",
                description: "User role has been successfully updated",
            });
        } catch (error) {
            console.error("Error updating role:", error);
            toaster.error({
                title: "Error updating role",
                description: error.message,
            });
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>User Management</h1>
            <table>
                <thead>
                    <tr>
                        <th>Email</th>
                        <th>Current Role</th>
                        <th>Change Role</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => {
                        const currentRole = getRoleValue(user.role);
                        return (
                            <tr key={user.id}>
                                <td>{user.email}</td>
                                <td>{currentRole}</td>
                                <td>
                                    <select
                                        value={currentRole}
                                        onChange={(e) => handleRoleChange(user.id, e)}
                                    >
                                        {Object.values(ROLES).map((role) => (
                                            <option key={role} value={role}>
                                                {role}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default UserManagement;