create database mango_market;

create role mango login password 'mango123';

grant all privileges on database mango_market to mango;