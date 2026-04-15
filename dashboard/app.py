import pandas as pd
import streamlit as st


st.set_page_config(page_title="Support Analytics Dashboard", page_icon="📊", layout="wide")

st.title("Agentic Customer Support Dashboard")
st.caption("Demo analytics view for the multi-agent support workflow")

sample_logs = pd.DataFrame(
    [
        {"request_id": "REQ-1001", "category": "billing", "sentiment": "negative", "status": "escalated", "response_time_seconds": 14},
        {"request_id": "REQ-1002", "category": "account", "sentiment": "neutral", "status": "resolved", "response_time_seconds": 5},
        {"request_id": "REQ-1003", "category": "technical", "sentiment": "negative", "status": "escalated", "response_time_seconds": 18},
        {"request_id": "REQ-1004", "category": "general", "sentiment": "positive", "status": "resolved", "response_time_seconds": 4},
        {"request_id": "REQ-1005", "category": "billing", "sentiment": "neutral", "status": "resolved", "response_time_seconds": 7},
    ]
)

total_queries = len(sample_logs)
resolved_queries = int((sample_logs["status"] == "resolved").sum())
escalated_queries = int((sample_logs["status"] == "escalated").sum())
avg_response_time = round(float(sample_logs["response_time_seconds"].mean()), 1)

col1, col2, col3, col4 = st.columns(4)
col1.metric("Total Queries", total_queries)
col2.metric("Resolved", resolved_queries)
col3.metric("Escalated", escalated_queries)
col4.metric("Avg Response Time (s)", avg_response_time)

left, right = st.columns(2)

with left:
    st.subheader("Category Distribution")
    st.bar_chart(sample_logs["category"].value_counts())

    st.subheader("Sentiment Distribution")
    st.bar_chart(sample_logs["sentiment"].value_counts())

with right:
    st.subheader("Status Split")
    st.bar_chart(sample_logs["status"].value_counts())

    st.subheader("Recent Logs")
    st.dataframe(sample_logs, use_container_width=True)

st.subheader("How to Use")
st.markdown(
    """
    - Replace the sample log dataframe with exports from `n8n`, a database, or a CSV file.
    - Add filters for channel, date range, and support category.
    - Connect the metrics to your real orchestration pipeline for the final demo.
    """
)
