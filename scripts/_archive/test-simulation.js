/**
 * Manual Test Script for Simulation Feature
 * 
 * This script tests the simulation endpoints manually
 * Run: node scripts/test-simulation.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const CRON_SECRET = 'your-super-secret-cron-key-change-this-in-production';

async function testRunSimulation() {
    console.log('\n🧪 Testing /api/cron/run-simulation...\n');

    try {
        const response = await axios.get(`${BASE_URL}/api/cron/run-simulation`, {
            headers: {
                'Authorization': `Bearer ${CRON_SECRET}`
            }
        });

        console.log('✅ Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        if (error.response) {
            console.log('❌ Error:', error.response.status, error.response.data);
        } else {
            console.log('❌ Error:', error.message);
        }
    }
}

async function testGetSimulations() {
    console.log('\n🧪 Testing /api/simulations...\n');

    const today = new Date().toISOString().split('T')[0];

    try {
        const response = await axios.get(`${BASE_URL}/api/simulations?date=${today}`);

        console.log('✅ Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        if (error.response) {
            console.log('❌ Error:', error.response.status, error.response.data);
        } else {
            console.log('❌ Error:', error.message);
        }
    }
}

async function testCleanup() {
    console.log('\n🧪 Testing /api/cron/cleanup-simulation...\n');

    try {
        const response = await axios.get(`${BASE_URL}/api/cron/cleanup-simulation`, {
            headers: {
                'Authorization': `Bearer ${CRON_SECRET}`
            }
        });

        console.log('✅ Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        if (error.response) {
            console.log('❌ Error:', error.response.status, error.response.data);
        } else {
            console.log('❌ Error:', error.message);
        }
    }
}

async function testUnauthorized() {
    console.log('\n🔒 Testing unauthorized access...\n');

    try {
        const response = await axios.get(`${BASE_URL}/api/cron/run-simulation`, {
            headers: {
                'Authorization': 'Bearer wrong-secret'
            }
        });
        console.log('❌ Should have been rejected but got:', response.status);
    } catch (error) {
        if (error.response && error.response.status === 401) {
            console.log('✅ Correctly rejected unauthorized request (401)');
        } else {
            console.log('❌ Unexpected error:', error.message);
        }
    }
}

async function runAllTests() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('  Simulation Feature - Test Suite');
    console.log('═══════════════════════════════════════════════════════');

    await testRunSimulation();
    await testGetSimulations();
    await testCleanup();
    await testUnauthorized();

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('  Tests Complete!');
    console.log('═══════════════════════════════════════════════════════\n');
}

runAllTests().catch(console.error);
