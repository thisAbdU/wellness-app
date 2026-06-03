from app.wellness.service import calculate_wellness_score


def test_wellness_score_high_sample() -> None:
    score = calculate_wellness_score(
        steps=10000,
        sleep_minutes=450,
        active_minutes=60,
        resting_heart_rate=65,
        workout_count=1,
    )

    assert score["total_score"] == 100
    assert score["activity_score"] == 30
    assert score["sleep_score"] == 30
    assert score["recovery_score"] == 20
    assert score["consistency_score"] == 20


def test_wellness_score_low_data() -> None:
    score = calculate_wellness_score(
        steps=500,
        sleep_minutes=180,
        active_minutes=0,
        resting_heart_rate=None,
        workout_count=0,
    )

    assert score["total_score"] < 50
