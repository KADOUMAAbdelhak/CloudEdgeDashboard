# Templating Language and OSR Service

The "Templating Language and OSR Service" submodule is an essential component of our project. It provides functionalities related to templating language integration and ontology-based semantic reasoning for deployment configurations.

# Functionality Overview

## Templating Language: 
Users can define deployment configurations using the provided templating language. They can specify various parameters, environment variables, service dependencies, resource allocation, and other relevant information required for deploying applications.

## Ontology Integration: 
The submodule integrates an ontology, which serves as a knowledge base defining domain-specific concepts, relationships, and validation rules. The ontology captures best practices, constraints, and dependencies for deployment configurations.

## Semantic Reasoning: 
The reasoner, based on the Hermit reasoner, is employed to perform semantic reasoning on the ontology and validate the deployment configurations. It infers logical consequences based on the ontology and applies reasoning algorithms to ensure consistency and adherence to defined standards.

## Validation and Inconsistency Detection: 
The submodule validates the deployment configurations against the ontology's constraints and rules. If inconsistencies are detected, the system provides detailed feedback on the inconsistent classes or attributes, assisting users in resolving issues and ensuring the configurations comply with the defined standards.

## Configuration

### Step 1: Clone the Repository

If you didn't clone the Repo yet, run the following command in your terminal:

`git clone https://github.com/miloudbagaa/semanticWebApp.git`

### Step 2: Initialize and update the submodule and Navigate to the Repository

`git submodule init`

`git submodule update`

`git submodule update --remote`

Change your current directory to the `ApplicationProfileService` directory:

`cd TemplatingLanguageService`

## Usage

### Frontend

To start the frontend server, Go to the "my-app" directory and run the following commands in:

`cd my-app`

`npm install`

`npm start`

The frontend server will run on `http://localhost:3000`

### Backend

Open a new Terminal and excute The following commands:

`cd TemplatingLanguageService`

`cd myproject`

`pip install Django`

`pip install owlready2`

`python manage.py runserver`

The Django backend server will run on `http://localhost:8000`.