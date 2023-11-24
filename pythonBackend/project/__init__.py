import json
import math
import time
from datetime import date
from subprocess import check_output

import sys
import os.path
from os import path

import requests
from urllib.request import urlopen, Request
from bs4 import BeautifulSoup
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import nltk
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from textblob import TextBlob, Word
from newspaper import Article
from transformers import PegasusTokenizer, PegasusForConditionalGeneration
import re
import csv
from dateutil import parser
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

# Download NLTK resources
nltk.download('vader_lexicon')
nltk.download('stopwords')
nltk.download('wordnet')
nltk.download('punkt')

# Clean the data
from nltk.corpus import stopwords
stop_words = stopwords.words("english")

other_stop_words = ['ev', 'pickup', 'stock', 'china']

from flask import Flask, jsonify, request
from flask_cors import CORS

# from .utils import check_if_train_model, split_train_test

app = Flask(__name__)



CORS(app)

# Function to parse data from Finviz
def finviz_parser_data(ticker):
    url = 'https://finviz.com/quote.ashx?t={}'.format(ticker)
    try:
        request = Request(url=url, headers={'user-agent': 'my-app'})
        response = urlopen(request)
        soup = BeautifulSoup(response, 'html.parser')
        return soup
    except Exception as e:
        print(e)

# Function to correct time formatting
def correct_time_formatting(time_data):
    formatted_dates = []
    for date_str in time_data:
        try:
            date = parser.parse(date_str)
            formatted_dates.append(date)
        except ValueError:
            formatted_dates.append(None)
    return formatted_dates


# Function to view Finviz data as a Pandas DataFrame
def finviz_view_pandas_dataframe(ticker):
    url = 'https://finviz.com/quote.ashx?t={}'.format(ticker)
    try:
        request = Request(url=url, headers={'user-agent': 'my-app'})
        response = urlopen(request)
        soup = BeautifulSoup(response, 'html.parser')
        news_reporter_title = [row.text for row in soup.find_all(class_='news-link-right') if row is not None]
        news_reported = [row.text for row in soup.find_all(class_='news-link-left') if row is not None]
        news_url = [row.find('a', href=True)["href"] for row in soup.find_all(class_='news-link-left') if row is not None]
        date_data = [row.text for row in soup.find_all('td', attrs={"width": "130", 'align': 'right'}) if row is not None]
        time = correct_time_formatting(date_data)
    except Exception as e:
        print(e)
    data = {"Time": time, 'News Reporter': news_reporter_title, "News Headline": news_reported, "URL": news_url}
    finviz_news_df = pd.DataFrame.from_dict(data)
    return finviz_news_df

# Example usage



def clean_data(df, column_filter='News Headline', other_column='Time_pdformat'):
    new_df = df.filter([column_filter, other_column])
    new_df['lower_case_headlines'] = new_df[column_filter].apply(lambda x: " ".join(word.lower() for word in x.split()))
    new_df['punctuation_remove'] = new_df['lower_case_headlines'].str.replace("[^\w\s]", "", regex=True)
    new_df["stop_words_removed"] = new_df['punctuation_remove'].apply(
        lambda x: " ".join(word for word in x.split() if word not in stop_words))
    new_df['lemmatizated'] = new_df["stop_words_removed"].apply(
        lambda x: ' '.join(Word(word).lemmatize() for word in x.split()))
    return new_df

def cleaning_secondary(df, apply_column="lemmatizated"):
    df['final_sentiment_cleaned'] = df[apply_column].apply(lambda x: " ".join(word for word in x.split() if word not in other_stop_words))
    return df



# Sentiment analysis

def sentiment_analyzer(df, column_applied_df="final_sentiment_cleaned", other_column="Time_pdformat"):
    analyzer = SentimentIntensityAnalyzer()
    df['nltk_subjective'] = df[column_applied_df].apply(lambda x: analyzer.polarity_scores(x)['compound'])
    df['nltk_positive'] = df[column_applied_df].apply(lambda x: analyzer.polarity_scores(x)['pos'])
    df['nltk_neutral'] = df[column_applied_df].apply(lambda x: analyzer.polarity_scores(x)['neu'])
    df['nltk_negative'] = df[column_applied_df].apply(lambda x: analyzer.polarity_scores(x)['neg'])
    df['textblob_polarity'] = df[column_applied_df].apply(lambda x: TextBlob(x).sentiment[0])
    df['textblob_subjective'] = df[column_applied_df].apply(lambda x: TextBlob(x).sentiment[1])
    new_df = df.filter([other_column, 'News Headline', column_applied_df, 'nltk_subjective', 'textblob_polarity', 'textblob_subjective'])
    return new_df




@app.route('/newAnalysis', methods=["GET"])
def get_companies():
    ticker_symbol = request.args.get('symbol') 
    soup = finviz_parser_data(ticker_symbol)
    news_dataframe = finviz_view_pandas_dataframe(ticker_symbol)
    news_dataframe["Time_pdformat"] = pd.to_datetime(news_dataframe['Time'], infer_datetime_format=True)
    cleaned_df = clean_data(news_dataframe, column_filter='News Headline', other_column='Time_pdformat')
    cleaned_final = cleaning_secondary(cleaned_df)
    sentiment = sentiment_analyzer(cleaned_final, column_applied_df="final_sentiment_cleaned")
    final_score = sentiment['nltk_subjective'].mean()
    final_score = float("{:.3f}".format(final_score))
    resp = jsonify(error=False, message="Score retrieved", final_score=final_score)
    return resp
