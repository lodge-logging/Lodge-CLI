![lodge-logo](https://github.com/lodge-logging/Lodge-CLI/blob/main/img/lodge_logo_color.png)

![shields.io npm version badge](https://img.shields.io/npm/v/lodge-cli)
![shields.io npm license badge](https://img.shields.io/npm/l/lodge-cli)
![shields.io custom website link badge](https://img.shields.io/static/v1?label=website&message=lodge-logging.github.io&color=blue)

## Overview

Lodge is an open source self-managed logging framework for small, distributed applications based on the Elastic stack. Lodge allows users to ship, transform, store, visualize, and monitor their logs.


[Read our case study for more information about logging observability and to learn how we built Lodge.](https://lodge-logging.github.io)

## The Team

**[Sam Clark](https://www.linkedin.com/in/sam-clark-0aa74390/)** _Software Engineer_ Dallas, TX

**[Rana Deeb](https://www.linkedin.com/in/rana-deeb/)** _Software Engineer_ San Francisco, CA

**[Regina Donovan](https://www.linkedin.com/in/regina-donovan-82242040/)** _Software Engineer_ Atlanta, GA

**[Justin Lo](https://www.linkedin.com/in/justinkevinheilo/)** _Software Engineer_ Vancouver, BC

---

## Table of Contents

- [Prerequisites](https://github.com/lodge-logging/Lodge-CLI#prerequisites)
- [Installing Lodge](https://github.com/lodge-logging/Lodge-CLI#installing-lodge)
- [Lodge CLI Commands](https://github.com/lodge-logging/Lodge-CLI#lodge-cli-commands)
- [Initializing Lodge](https://github.com/lodge-logging/Lodge-CLI#initializing-lodge)
- [Deploying Lodge](https://github.com/lodge-logging/Lodge-CLI#deploying-lodge)
- [Tearing Down Lodge](https://github.com/lodge-logging/Lodge-CLI#tearing-down-lodge)
- [Connecting To Lodge](https://github.com/lodge-logging/Lodge-CLI#connecting-to-lodge)
- [Helpful Resources](https://github.com/lodge-logging/Lodge-CLI#helpful-resources)

---

## Prerequisites

- Node.js (v14)
- NPM
- AWS Account
- AWS CLI configured with a default region that has at least 3 availability zones
- AWS Cloud Development Kit CLI
- AWS Software Development Kit CLI
- AWS System Manager CLI

You'll need to have the above accounts and tools before running any Lodge CLI commands. The Lodge CLI is an NPM package that deploys an AWS CDK application in Node.js. An AWS account and CLI tools are required to deploy the Lodge infrastructure to AWS.

---

## Installing Lodge CLI

```sh
npm i -g lodge-cli
```

![lodge install](https://github.com/lodge-logging/Lodge-CLI/blob/main/img/lodge-install.gif)

## Lodge CLI Commands

| Command                 | Description                                                                                                                                                            |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `lodge init`         | Initialize the CDK application and prepare for deployment.                                                                               |
| `lodge deploy`       | Launches a configuration wizard, generates CloudFormation templates, and deploys Lodge to AWS |
| `lodge destroy`    | Tears down the AWS infrastructure that is hosting Lodge            |
| `lodge connect` | Starts an AWS SSM session with the Lodge bastion host                                                                                                                   |

---

## Initializing Lodge

To initialize the Lodge application, run `lodge init`.

![lodge init](https://github.com/lodge-logging/Lodge-CLI/blob/main//img/lodge-init.gif)

### `lodge init`

This command will:
- Verify that prerequisites are met
- Clone the CDK application locally
- Install the dependencies
- Generate an AWS key-pair 

---

## Deploying Lodge

To deploy Lodge, run `lodge deploy`.

![lodge deploy](https://github.com/lodge-logging/Lodge-CLI/blob/main//img/lodge-deploy.gif)

### `lodge deploy`

This command will start an interactive wizard for configuring the deployment. The prompts include:
- Selecting an existing or creating a new AWS Virtual Private Cloud (VPC)
- If using an existing VPC
  - Choose the VPC from the list fetched from your AWS account
  - Choose the public subnet you wish to use to deploy the dashboard
  - Choose the private subnets you wish to use to deploy the rest of the pipeline
- If using a new VPC
  - Enter the CIDR block of the network you will be shipping logs from

Once the wizard is complete, the CDK application will generate a series of CloudFormation templates that will take up to an hour to finish deploying on your account. You will see status updates in the terminal as well as in the CloudFormation console in AWS.

## Tearing Down Lodge

To tear down the Lodge pipeline, run `lodge destroy`

### `lodge destroy`

After confirming that you wish to destroy the CloudFormation stacks, the Lodge CLI will begin the teardown process. This process will also take upwards of an hour.

---

## Connecting to Lodge

To connect to the Lodge pipeline, run `lodge connect`

### `lodge connect`

This command will begin an AWS System Manager (SSM) session with the bastion host. From there, you can run `./lodge-connect <component>` to SSH directly to Lodge components. Host names include:
- zookeeper1
- zookeeper2
- zookeeper3
- kafka1
- kafka2
- kafka3
- es1
- es2
- es3
- kibana
- webTools

---

## Helpful Resources

- [AWS CLI Setup](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-welcome.html)
- [Lodge Case Study](https://lodge-logging.github.io)
