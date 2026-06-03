from __future__ import annotations


def calculate_wellness_score(
	steps: int,
	sleep_minutes: int,
	active_minutes: int,
	resting_heart_rate: int | None,
	workout_count: int,
) -> dict:
	if steps >= 10000:
		activity_score = 30
	elif steps >= 7000:
		activity_score = 25
	elif steps >= 4000:
		activity_score = 15
	else:
		activity_score = 5

	if sleep_minutes >= 420:
		sleep_score = 30
	elif sleep_minutes >= 360:
		sleep_score = 20
	elif sleep_minutes >= 300:
		sleep_score = 10
	else:
		sleep_score = 0

	recovery_score = 20

	if resting_heart_rate is not None:
		if resting_heart_rate < 60:
			recovery_score += 0
		elif resting_heart_rate < 70:
			recovery_score += 0
		elif resting_heart_rate < 80:
			recovery_score -= 5
		elif resting_heart_rate < 90:
			recovery_score -= 10
		else:
			recovery_score -= 15

	if sleep_minutes < 100:
		recovery_score -= 5

	recovery_score = max(recovery_score, 0)

	if steps >= 7000 or active_minutes >= 30 or workout_count > 0:
		consistency_score = 20
	elif steps >= 4000:
		consistency_score = 10
	else:
		consistency_score = 0

	total_score = activity_score + sleep_score + recovery_score + consistency_score

	return {
		"activity_score": activity_score,
		"sleep_score": sleep_score,
		"recovery_score": recovery_score,
		"consistency_score": consistency_score,
		"total_score": total_score,
	}
