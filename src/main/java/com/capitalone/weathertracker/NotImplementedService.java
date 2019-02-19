package com.capitalone.weathertracker;

import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.capitalone.weathertracker.measurements.*;
import com.capitalone.weathertracker.statistics.*;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
class NotImplementedService implements MeasurementQueryService, MeasurementStore, MeasurementAggregator {

	public static List<Measurement> weather = new ArrayList<>();

	@Override
	public void add(Measurement measurement) {
		weather.add(measurement);
		throw new ResponseStatusException(HttpStatus.ACCEPTED);

	}

	@Override
	public Measurement fetch(ZonedDateTime timestamp) {
		if (timestamp != null) {
			for (Measurement measurement : weather) {
				if (measurement.getTimestamp().toLocalDateTime().equals(timestamp.toLocalDateTime())) {
					return measurement;
				}
			}
			throw new ResponseStatusException(HttpStatus.NOT_FOUND);
		}
		throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
	}

	@Override
	public List<Measurement> queryDateRange(ZonedDateTime from, ZonedDateTime to) {
		if (from != null && to != null) {
			List<Measurement> measurments = new ArrayList<Measurement>();

			for (Measurement measurement : weather) {
				if ((measurement.getTimestamp().toLocalDateTime().equals(from.toLocalDateTime())
						|| measurement.getTimestamp().toLocalDateTime().isAfter(from.toLocalDateTime()))
						&& measurement.getTimestamp().toLocalDateTime().isBefore(to.toLocalDateTime())) {
					measurments.add(measurement);
				}
			}
			return measurments;
		}
		throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
	}

	@Override
	public List<AggregateResult> analyze(List<Measurement> measurements, List<String> metrics, List<Statistic> stats) {
		List<AggregateResult> aggregates = new ArrayList<>();
		AggregateResult aggregate = null;
		Double averageValue = 0.0;
		for (String metric : metrics) {
			for (Statistic stat : stats) {
				Double value = 0.0;
				int iteration = 0;
				boolean keyFoundInMeasurements = false;

				for (Measurement measurement : measurements) {
					Map<String, Double> dataMetrics = measurement.getMetrics();
					if (dataMetrics.containsKey(metric)) {
						keyFoundInMeasurements = true;

						for (Map.Entry<String, Double> dataMetric : dataMetrics.entrySet()) {
							if (dataMetric.getKey().equalsIgnoreCase(metric)) {
								Double dataValue = dataMetric.getValue();
								if (!dataMetric.getValue().isNaN()) {
									if (iteration == 0) {
										value = dataValue;
										if (stat.equals(Statistic.AVERAGE)) {
											value = (double) Math.round(averageValue * 100) / (100 * 2);
											break;
										}
									} else {

										if (stat.equals(Statistic.MIN)) {
											if (value > dataValue) {
												value = dataValue;
											}
										}
										if (stat.equals(Statistic.MAX)) {
											if (value < dataValue) {
												value = dataValue;
											}
										}

									}
									iteration++;
								}
							}
						}
					}
				}
				if (keyFoundInMeasurements) {
					aggregate = new AggregateResult(metric, stat, value);
					aggregates.add(aggregate);
				}
				if (!stat.equals(Statistic.AVERAGE)) {
					averageValue += value;
				} else {
					averageValue = 0.00;
				}
			}
		}
		return aggregates;
	}
}
