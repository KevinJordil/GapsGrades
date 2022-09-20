# Gaps new grades notifier

Sends a Telegram notification when there is a new note on Gaps

## Prerequisites

Install [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

## Installation

After cloning the repo, you have to install the dependencies with `npm -i`.

## Configuration


In the configuration file you have to enter several information:
* Your AAI username and password
* The id of the Telegram bot (there are many tutorials on the internet to create one)
* The id of the conversation/group with the bot (You can find how to get it on the internet)

## Usage

Personally I made a shell script that contains this line `/usr/bin/node /<path>/GapsGrades/get.js`. Then I run it at different times of the day with crontab on linux, like this `0 8,11,14,17,20 * * * /<path>/script.sh`. You can also run it manually with `node get.js`.








