import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import styles from '../styles/Login.module.css';
import { text } from 'dom-helpers';
import { useState } from 'react';
import Axios from 'axios';
import {useRouter} from 'next/router';
import { useEffect } from "react";

const Register = () => {
    const [email, setEmail ] = useState('');
    const [password, setPassword ] = useState('');
    const [confirmed, setConfirmed] = useState('');
    const [username, setUsername] = useState('');
    const router = useRouter();

    useEffect(() => {
        localStorage.setItem("token",'');
      }, [])


    const registerUser = (e) =>{
        e.preventDefault();
        const validationError = validateData(email, username, password, confirmed); 
        if(validationError ==""){
            Axios.post('http://localhost:3001/auth/register',{
                email : email,
                username : username,
                password : password 
            }).then((response =>{
                router.push('/login');
            })).catch(err => {
                alert(err.response.data.message);
                console.log(err);
            });
        }
        else
            alert(validationError);
    }
    const validateData = (email,username,password,confirmed) =>{
        const s=""
        if(!email || email.length < 5 || !(email.includes('@')))
            s+="Email was incorrect\n"
        if(!username ||username.length < 5)
            s+="Username must be longer than 5 characters\n"
        if(!password  || password.length < 5)  
            s+="Password must be longer than 5 characters\n"
        if(!confirmed || password !== confirmed)
            s+="Password and confirm password doesn't match\n"
       return s;
    }

    return (  
    <div className={styles.align_center}>
        <div className={styles.login}>
        <Form onSubmit={registerUser}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label className = {styles.label}>Email</Form.Label>
                <Form.Control type="text" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value) }/>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicUsername">
                <Form.Label className = {styles.label}>Username</Form.Label>
                <Form.Control type="text" placeholder="username" value={username} onChange={(e)=>setUsername(e.target.value) }/>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label className = {styles.label}>Password</Form.Label>
                <Form.Control type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value) }/>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicConfirmed">
                <Form.Label className = {styles.label}>Confirmed password</Form.Label>
                <Form.Control type="password" placeholder="Confirm password" value={confirmed} onChange={(e)=>setConfirmed(e.target.value) }/>
            </Form.Group>
            <Button variant="primary" type="submit" >
                Submit
            </Button>
        </Form>
        </div>
    </div>
    );
}
 
export default Register;
