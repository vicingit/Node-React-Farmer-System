import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import GetRecommendation from './GetRecommendation';
import Orders from './Orders';

const FarmerDash = () => {
  return (
    <>
      <div>
        <div className="flex flex-col h-screen">
          {/* Navigation */}
          <nav className="bg-white border-b border-gray-200 fixed z-30 w-full flex items-center justify-between px-4 py-1">
            {/* Logo */}
            <Link to="/home/farmer" className="flex items-center text-xl font-bold">
              <img src="https://ik.imagekit.io/pibjyepn7p9/Lilac_Navy_Simple_Line_Business_Logo_CGktk8RHK.png?ik-sdk-version=javascript-1.4.3&updatedAt=1649962071315" className="h-6 mr-2" alt="Windster Logo"/>
              <span>Farmer</span>
            </Link>

            {/* Navigation links */}
            <div className="flex items-center space-x-4">
              <Link to="/home/farmer/get-recommendation" className="text-gray-600 hover:text-gray-900">Get Recommendation</Link>
              <Link to="/home/farmer/orders" className="text-gray-600 hover:text-gray-900">Orders</Link>
              {/* Replace Profile link with logout button */}
              <Link to="/logout" className="text-gray-600 hover:text-gray-900 hidden sm:inline-flex ml-5 font-medium text-sm">
                <svg className="svg-inline--fa fa-gem -ml-1 mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="gem" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                  <path fill="currentColor" d="M378.7 32H133.3L256 182.7L378.7 32zM512 192l-107.4-141.3L289.6 192H512zM107.4 50.67L0 192h222.4L107.4 50.67zM244.3 474.9C247.3 478.2 251.6 480 256 480s8.653-1.828 11.67-5.062L510.6 224H1.365L244.3 474.9z"></path>
                </svg>
                Log out
              </Link>
            </div>
          </nav>

          {/* Main Content */}
          <div className="flex-grow bg-gray-100 p-8">
            <Routes>
              <Route path="/home/farmer/get-recommendation" element={<GetRecommendation />} />
              <Route path="/home/farmer/orders" element={<Orders />} />
              {/* <Route path="*" element={<NotFound />} /> */}
            </Routes>

            {/* Welcome message */}
            <div className="text-center text-gray-700 mt-4">
              <h1 className="text-2xl font-bold">Welcome, Farmer!</h1>
              <p className="mt-2">We're glad to have you here.</p>
            </div>

            <GetRecommendation />
            <Orders />
          </div>
        </div>
      </div>
    </>
  );
};

export default FarmerDash;
