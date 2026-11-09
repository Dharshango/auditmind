from typing import List, Dict, Any, Optional
from pydantic import BaseModel


class RecurrenceCluster(BaseModel):
    category: str
    facilities_affected: List[str]
    recurring_findings_count: int
    sample_titles: List[str]
    time_window_days: int = 90


class FacilityRecurrenceBreakdown(BaseModel):
    facility_code: str
    name: str
    total_findings: int
    recurring_findings: int
    recurrence_rate_percent: float


class RecurrenceAnalyticsResponse(BaseModel):
    organization_id: str
    total_findings: int
    recurring_findings_count: int
    overall_recurrence_rate_percent: float
    categories_with_recurrence: int
    recurrence_clusters: List[RecurrenceCluster]
    facility_breakdowns: List[FacilityRecurrenceBreakdown]
    recurrence_intervals: Dict[str, int]
