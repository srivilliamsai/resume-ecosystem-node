{{/*
kubernetes/resume-ecosystem/templates/services/_microservice.tpl
Reusable template for microservice deployments
*/}}

{{- define "resume-ecosystem.microservice" -}}
{{- $root := index . 0 }}
{{- $name := index . 1 }}
{{- $config := index . 2 }}
{{- $port := index . 3 }}

{{- if $config.enabled }}
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "resume-ecosystem.fullname" $root }}-{{ $name }}
  namespace: {{ include "resume-ecosystem.namespace" $root }}
  labels:
    {{- include "resume-ecosystem.serviceLabels" (list $root $name) | nindent 4 }}
spec:
  {{- if not $config.autoscaling.enabled }}
  replicas: {{ $config.replicaCount }}
  {{- end }}
  selector:
    matchLabels:
      {{- include "resume-ecosystem.serviceSelectorLabels" (list $root $name) | nindent 6 }}
  template:
    metadata:
      annotations:
        checksum/config: {{ include (print $root.Template.BasePath "/configmap.yaml") $root | sha256sum }}
        checksum/secret: {{ include (print $root.Template.BasePath "/secrets.yaml") $root | sha256sum }}
      labels:
        {{- include "resume-ecosystem.serviceSelectorLabels" (list $root $name) | nindent 8 }}
    spec:
      {{- if $root.Values.global.imagePullSecrets }}
      imagePullSecrets:
        {{- range $root.Values.global.imagePullSecrets }}
        - name: {{ .name }}
        {{- end }}
      {{- end }}
      serviceAccountName: {{ include "resume-ecosystem.serviceAccountName" $root }}
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
        fsGroup: 1000
      containers:
        - name: {{ $name }}
          image: {{ include "resume-ecosystem.image" (list $root $config.image) }}
          imagePullPolicy: {{ $root.Values.global.imagePullPolicy }}
          ports:
            - name: http
              containerPort: {{ $port }}
              protocol: TCP
          env:
            - name: PORT
              value: {{ $port | quote }}
            {{- include "resume-ecosystem.commonEnv" $root | nindent 12 }}
          {{- include "resume-ecosystem.livenessProbe" $root | nindent 10 }}
          {{- include "resume-ecosystem.readinessProbe" $root | nindent 10 }}
          resources:
            {{- toYaml $config.resources | nindent 12 }}
          securityContext:
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
            capabilities:
              drop:
                - ALL
          volumeMounts:
            - name: tmp
              mountPath: /tmp
      volumes:
        - name: tmp
          emptyDir: {}
      {{- with $config.nodeSelector }}
      nodeSelector:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      {{- with $config.affinity }}
      affinity:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      {{- with $config.tolerations }}
      tolerations:
        {{- toYaml . | nindent 8 }}
      {{- end }}

---
apiVersion: v1
kind: Service
metadata:
  name: {{ include "resume-ecosystem.fullname" $root }}-{{ $name }}
  namespace: {{ include "resume-ecosystem.namespace" $root }}
  labels:
    {{- include "resume-ecosystem.serviceLabels" (list $root $name) | nindent 4 }}
spec:
  type: ClusterIP
  ports:
    - port: {{ $port }}
      targetPort: http
      protocol: TCP
      name: http
  selector:
    {{- include "resume-ecosystem.serviceSelectorLabels" (list $root $name) | nindent 4 }}

{{- if $config.autoscaling.enabled }}
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: {{ include "resume-ecosystem.fullname" $root }}-{{ $name }}
  namespace: {{ include "resume-ecosystem.namespace" $root }}
  labels:
    {{- include "resume-ecosystem.serviceLabels" (list $root $name) | nindent 4 }}
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: {{ include "resume-ecosystem.fullname" $root }}-{{ $name }}
  minReplicas: {{ $config.autoscaling.minReplicas }}
  maxReplicas: {{ $config.autoscaling.maxReplicas }}
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: {{ $config.autoscaling.targetCPUUtilization }}
{{- end }}

{{- if $root.Values.podDisruptionBudget.enabled }}
---
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: {{ include "resume-ecosystem.fullname" $root }}-{{ $name }}
  namespace: {{ include "resume-ecosystem.namespace" $root }}
  labels:
    {{- include "resume-ecosystem.serviceLabels" (list $root $name) | nindent 4 }}
spec:
  {{- if $root.Values.podDisruptionBudget.minAvailable }}
  minAvailable: {{ $root.Values.podDisruptionBudget.minAvailable }}
  {{- else }}
  maxUnavailable: {{ $root.Values.podDisruptionBudget.maxUnavailable }}
  {{- end }}
  selector:
    matchLabels:
      {{- include "resume-ecosystem.serviceSelectorLabels" (list $root $name) | nindent 6 }}
{{- end }}

{{- end }}
{{- end }}
