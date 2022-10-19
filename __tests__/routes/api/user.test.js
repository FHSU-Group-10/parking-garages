const request = require('supertest');
const assert = require('assert');
const express = require('express');

const app = require('../../../app');

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended: true}));

describe('User Controller', () => {
    describe('Get single user information', () => {
        let obj = {
            usernname: 'user1',
            password: 'aaaa'
        };
    
        test('Valid query', async () => {
           let result = request(app).post('/user/login').send(obj);
        });
        
        
        
    });
});