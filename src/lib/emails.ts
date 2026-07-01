import { Resend } from "resend";
import type { Teacher, AccumulationRequest, UsageRequest } from "./supabase";
import { fullName, formatDate, formatDateTime } from "./utils";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY!);
}
function getFrom() { return process.env.RESEND_FROM_EMAIL!; }
function getDirector() { return process.env.DIRECTOR_EMAIL!; }

function baseHtml(title: string, body: string) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:16px;background:#f9f9f8;font-family:Inter,Arial,sans-serif;-webkit-text-size-adjust:100%">
  <div style="max-width:540px;width:100%;margin:0 auto;background:#ffffff;border-radius:8px;border:1px solid #e9e9e7;padding:28px;box-sizing:border-box">

    <!-- Header con logo -->
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid #e9e9e7">
      <img src="https://res.cloudinary.com/dcwxslhjf/image/upload/v1782579289/LogoManuelaNuevo_zlrwq7.png"
           alt="Escuela Manuela Santa María"
           style="height:32px;width:auto;object-fit:contain;flex-shrink:0" />
      <span style="font-size:12px;color:#9b9a97">Escuela Manuela Santa Mar&iacute;a</span>
    </div>

    <h1 style="font-size:18px;font-weight:600;color:#1a1a1a;margin:0 0 20px">${title}</h1>

    ${body}

    <p style="font-size:11px;color:#9b9a97;margin:24px 0 0;border-top:1px solid #e9e9e7;padding-top:14px">
      Este correo es informativo. No requiere respuesta.
    </p>
  </div>
</body>
</html>`;
}

function row(label: string, value: string) {
  return `
  <tr>
    <td style="padding:7px 8px 7px 0;color:#6b6b6a;font-size:13px;vertical-align:top;white-space:nowrap;width:130px">${label}</td>
    <td style="padding:7px 0;color:#1a1a1a;font-size:13px;vertical-align:top;word-break:break-word;overflow-wrap:anywhere">${value}</td>
  </tr>`;
}

function table(rows: string) {
  return `<table style="border-collapse:collapse;width:100%;margin:14px 0;table-layout:fixed">${rows}</table>`;
}

export async function sendAccumulationConfirmationToTeacher(teacher: Teacher, req: AccumulationRequest) {
  const body = `
    <p style="color:#4b4b4a;font-size:14px;margin:0 0 12px">Hola <strong>${fullName(teacher)}</strong>, recibimos su solicitud de acumulaci&oacute;n.</p>
    ${table(
      row("Estado", '<span style="background:#fff3cd;color:#856404;padding:2px 8px;border-radius:4px;font-size:12px;white-space:nowrap">Pendiente de revisi&oacute;n</span>') +
      row("Fecha acumulada", formatDate(req.fecha_acumulada)) +
      row("Materia", req.materia) +
      row("Cantidad", `${req.cantidad_lecciones} lecci&oacute;n(es)`) +
      row("Horarios", req.lecciones.join(", "))
    )}
    <p style="color:#4b4b4a;font-size:13px;margin:0">La directora revisar&aacute; su solicitud y recibir&aacute; una notificaci&oacute;n por correo con la decisi&oacute;n.</p>`;

  return getResend().emails.send({
    from: getFrom(),
    to: teacher.correo!,
    subject: "Recibimos su solicitud de acumulacion",
    html: baseHtml("Solicitud de acumulacion recibida", body),
  });
}

export async function sendAccumulationNotificationToDirector(teacher: Teacher, req: AccumulationRequest) {
  const body = `
    <p style="color:#4b4b4a;font-size:14px;margin:0 0 12px">Nueva solicitud de acumulaci&oacute;n recibida.</p>
    ${table(
      row("Docente", fullName(teacher)) +
      row("C&eacute;dula", teacher.cedula) +
      row("Correo", teacher.correo ?? "—") +
      row("Fecha acumulada", formatDate(req.fecha_acumulada)) +
      row("Materia", req.materia) +
      row("Cantidad", `${req.cantidad_lecciones} lecci&oacute;n(es)`) +
      row("Horarios", req.lecciones.join(", ")) +
      row("Observaciones", req.detalle || "—")
    )}`;

  return getResend().emails.send({
    from: getFrom(),
    to: getDirector(),
    subject: `Nueva acumulacion: ${fullName(teacher)}`,
    html: baseHtml(`Nueva acumulacion &mdash; ${fullName(teacher)}`, body),
  });
}

export async function sendUsageConfirmationToTeacher(teacher: Teacher, req: UsageRequest) {
  const body = `
    <p style="color:#4b4b4a;font-size:14px;margin:0 0 12px">Hola <strong>${fullName(teacher)}</strong>, recibimos su solicitud de rebajo.</p>
    ${table(
      row("Estado", '<span style="background:#fff3cd;color:#856404;padding:2px 8px;border-radius:4px;font-size:12px;white-space:nowrap">Pendiente de revisi&oacute;n</span>') +
      row("Fecha propuesta", formatDate(req.fecha_rebajo_propuesta)) +
      row("Hora de salida", req.hora_salida) +
      row("Lecciones a usar", `${req.lecciones_a_usar} lecci&oacute;n(es)`) +
      row("Motivo", req.motivo)
    )}
    <p style="color:#4b4b4a;font-size:13px;margin:0">La directora revisar&aacute; su solicitud y recibir&aacute; una notificaci&oacute;n con la decisi&oacute;n.</p>`;

  return getResend().emails.send({
    from: getFrom(),
    to: teacher.correo!,
    subject: "Recibimos su solicitud de rebajo",
    html: baseHtml("Solicitud de rebajo recibida", body),
  });
}

export async function sendUsageNotificationToDirector(teacher: Teacher, req: UsageRequest) {
  const body = `
    <p style="color:#4b4b4a;font-size:14px;margin:0 0 12px">Nueva solicitud de rebajo recibida.</p>
    ${table(
      row("Docente", fullName(teacher)) +
      row("C&eacute;dula", teacher.cedula) +
      row("Correo", teacher.correo ?? "—") +
      row("Fecha propuesta", formatDate(req.fecha_rebajo_propuesta)) +
      row("Hora de salida", req.hora_salida) +
      row("Lecciones a usar", `${req.lecciones_a_usar} lecci&oacute;n(es)`) +
      row("Motivo", req.motivo) +
      (req.detalle ? row("Detalle adicional", req.detalle) : "")
    )}`;

  return getResend().emails.send({
    from: getFrom(),
    to: getDirector(),
    subject: `Nuevo rebajo: ${fullName(teacher)}`,
    html: baseHtml(`Nuevo rebajo &mdash; ${fullName(teacher)}`, body),
  });
}

export async function sendDecisionToTeacher(
  teacher: Teacher,
  type: "acumulacion" | "rebajo",
  estado: "aprobada" | "rechazada",
  comentario: string,
  fecha_decision: string
) {
  const approved = estado === "aprobada";
  const statusBadge = approved
    ? '<span style="background:#d1fae5;color:#065f46;padding:2px 8px;border-radius:4px;font-size:12px;white-space:nowrap">Aprobada</span>'
    : '<span style="background:#fee2e2;color:#991b1b;padding:2px 8px;border-radius:4px;font-size:12px;white-space:nowrap">Rechazada</span>';

  const body = `
    <p style="color:#4b4b4a;font-size:14px;margin:0 0 12px">Hola <strong>${fullName(teacher)}</strong>, su solicitud de ${type} ha sido procesada.</p>
    ${table(
      row("Decisi&oacute;n", statusBadge) +
      row("Fecha de decisi&oacute;n", formatDateTime(fecha_decision)) +
      row("Comentario", comentario || "Sin comentario adicional.")
    )}`;

  const subject = approved ? `Su ${type} fue aprobada` : `Su ${type} fue rechazada`;

  return getResend().emails.send({
    from: getFrom(),
    to: teacher.correo!,
    subject,
    html: baseHtml(`Su solicitud de ${type} fue ${estado}`, body),
  });
}
