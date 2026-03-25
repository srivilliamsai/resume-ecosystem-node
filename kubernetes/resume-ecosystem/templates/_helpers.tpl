{{/*
kubernetes/resume-ecosystem/templates/_helpers.tpl
Common template helpers for resume-ecosystem Helm chart
*/}}

{{/*
Expand the name of the chart.
*/}}
{{- define "resume-ecosystem.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "resume-ecosystem.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "resume-ecosystem.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "resume-ecosystem.labels" -}}
helm.sh/chart: {{ include "resume-ecosystem.chart" . }}
{{ include "resume-ecosystem.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/part-of: resume-ecosystem
{{- end }}

{{/*
Selector labels
*/}}
{{- define "resume-ecosystem.selectorLabels" -}}
app.kubernetes.io/name: {{ include "resume-ecosystem.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "resume-ecosystem.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "resume-ecosystem.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Create a service-specific fullname
*/}}
{{- define "resume-ecosystem.serviceName" -}}
{{- $root := index . 0 }}
{{- $serviceName := index . 1 }}
{{- printf "%s-%s" (include "resume-ecosystem.fullname" $root) $serviceName | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Service labels
*/}}
{{- define "resume-ecosystem.serviceLabels" -}}
{{- $root := index . 0 }}
{{- $serviceName := index . 1 }}
{{ include "resume-ecosystem.labels" $root }}
app.kubernetes.io/component: {{ $serviceName }}
{{- end }}

{{/*
Service selector labels
*/}}
{{- define "resume-ecosystem.serviceSelectorLabels" -}}
{{- $root := index . 0 }}
{{- $serviceName := index . 1 }}
{{ include "resume-ecosystem.selectorLabels" $root }}
app.kubernetes.io/component: {{ $serviceName }}
{{- end }}

{{/*
Get image name with optional registry prefix
*/}}
{{- define "resume-ecosystem.image" -}}
{{- $root := index . 0 }}
{{- $image := index . 1 }}
{{- if $root.Values.global.imageRegistry }}
{{- printf "%s/%s:%s" $root.Values.global.imageRegistry $image.repository $image.tag }}
{{- else }}
{{- printf "%s:%s" $image.repository $image.tag }}
{{- end }}
{{- end }}

{{/*
PostgreSQL connection URL
*/}}
{{- define "resume-ecosystem.postgresUrl" -}}
{{- if .Values.postgresql.external.enabled }}
{{- printf "postgresql://%s:%s@%s:%d/%s" .Values.secrets.postgresUser .Values.secrets.postgresPassword .Values.postgresql.external.host (int .Values.postgresql.external.port) .Values.postgresql.external.database }}
{{- else }}
{{- printf "postgresql://%s:%s@%s-postgresql:5432/resume_db" .Values.secrets.postgresUser .Values.secrets.postgresPassword (include "resume-ecosystem.fullname" .) }}
{{- end }}
{{- end }}

{{/*
Redis connection URL
*/}}
{{- define "resume-ecosystem.redisUrl" -}}
{{- if .Values.redis.external.enabled }}
{{- printf "redis://%s:%d" .Values.redis.external.host (int .Values.redis.external.port) }}
{{- else }}
{{- printf "redis://%s-redis:6379" (include "resume-ecosystem.fullname" .) }}
{{- end }}
{{- end }}

{{/*
Kafka broker URL
*/}}
{{- define "resume-ecosystem.kafkaBroker" -}}
{{- if .Values.kafka.strimzi.existingCluster }}
{{- printf "%s-kafka-bootstrap:9092" .Values.kafka.strimzi.existingCluster }}
{{- else }}
{{- printf "%s-kafka-kafka-bootstrap:9092" (include "resume-ecosystem.fullname" .) }}
{{- end }}
{{- end }}

{{/*
Namespace to use
*/}}
{{- define "resume-ecosystem.namespace" -}}
{{- default .Release.Namespace .Values.global.namespace }}
{{- end }}

{{/*
Common environment variables for all services
*/}}
{{- define "resume-ecosystem.commonEnv" -}}
- name: NODE_ENV
  valueFrom:
    configMapKeyRef:
      name: {{ include "resume-ecosystem.fullname" . }}-config
      key: NODE_ENV
- name: LOG_LEVEL
  valueFrom:
    configMapKeyRef:
      name: {{ include "resume-ecosystem.fullname" . }}-config
      key: LOG_LEVEL
- name: POSTGRES_URL
  valueFrom:
    secretKeyRef:
      name: {{ include "resume-ecosystem.fullname" . }}-secrets
      key: POSTGRES_URL
- name: REDIS_URL
  valueFrom:
    configMapKeyRef:
      name: {{ include "resume-ecosystem.fullname" . }}-config
      key: REDIS_URL
- name: KAFKA_BROKER
  valueFrom:
    configMapKeyRef:
      name: {{ include "resume-ecosystem.fullname" . }}-config
      key: KAFKA_BROKER
- name: JWT_SECRET
  valueFrom:
    secretKeyRef:
      name: {{ include "resume-ecosystem.fullname" . }}-secrets
      key: JWT_SECRET
- name: JWT_EXPIRATION
  valueFrom:
    configMapKeyRef:
      name: {{ include "resume-ecosystem.fullname" . }}-config
      key: JWT_EXPIRATION
- name: OTEL_ENABLED
  valueFrom:
    configMapKeyRef:
      name: {{ include "resume-ecosystem.fullname" . }}-config
      key: OTEL_ENABLED
- name: OTEL_EXPORTER_OTLP_ENDPOINT
  valueFrom:
    configMapKeyRef:
      name: {{ include "resume-ecosystem.fullname" . }}-config
      key: OTEL_EXPORTER_OTLP_ENDPOINT
{{- end }}

{{/*
Liveness probe configuration
*/}}
{{- define "resume-ecosystem.livenessProbe" -}}
livenessProbe:
  httpGet:
    path: /health
    port: http
  initialDelaySeconds: 15
  periodSeconds: 20
  timeoutSeconds: 5
  failureThreshold: 3
{{- end }}

{{/*
Readiness probe configuration
*/}}
{{- define "resume-ecosystem.readinessProbe" -}}
readinessProbe:
  httpGet:
    path: /ready
    port: http
  initialDelaySeconds: 5
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3
{{- end }}
