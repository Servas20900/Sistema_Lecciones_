import { Resend } from "resend";
import type { Teacher, AccumulationRequest, UsageRequest } from "./supabase";
import { fullName, formatDate, formatDateTime } from "./utils";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY!);
}
function getFrom() { return process.env.RESEND_FROM_EMAIL!; }
function getDirector() { return process.env.DIRECTOR_EMAIL!; }

function baseHtml(title: string, body: string) {
  return `<!DOCTYPE html><html><body style="font-family:Inter,sans-serif;background:#f9f9f8;margin:0;padding:32px">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:8px;border:1px solid #e9e9e7;padding:40px">
  <p style="font-size:13px;color:#9b9a97;margin:0 0 24px">Escuela Manuela Santa Mar&iacute;a</p>
  <h1 style="font-size:20px;font-weight:600;color:#1a1a1a;margin:0 0 24px">${title}</h1>
  ${body}
  <p style="font-size:12px;color:#9b9a97;margin:32px 0 0;border-top:1px solid #e9e9e7;padding-top:16px">
    Este correo es informativo. No requiere respuesta.
  </p>
</div></body></html>`;
}

function row(label: string, value: string) {
  return `<tr><td style="padding:6px 0;color:#6b6b6a;font-size:14px;width:180px">${label}</td><td style="padding:6px 0;color:#1a1a1a;font-size:14px">${value}</td></tr>`;
}

export async function sendAccumulationConfirmationToTeacher(teacher: Teacher, req: AccumulationRequest) {
  const body = `
    <p style="color:#4b4b4a;font-size:14px">Hola <strong>${fullName(teacher)}</strong>, recibimos su solicitud de acumulaci&oacute;n.</p>
    <table style="border-collapse:collapse;width:100%;margin:16px 0">
      ${row("Estado", '<span style="background:#fff3cd;color:#856404;padding:2px 8px;border-radius:4px;font-size:12px">Pendiente de revisi&oacute;n</span>')}
      ${row("Fecha acumulada", formatDate(req.fecha_acumulada))}
      ${row("Materia", req.materia)}
      ${row("Cantidad", `${req.cantidad_lecciones} lecci&oacute;n(es)`)}
      ${row("Horarios", req.lecciones.join(", "))}
    </table>
    <p style="color:#4b4b4a;font-size:14px">La directora revisar&aacute; su solicitud y recibir&aacute; una notificaci&oacute;n por correo con la decisi&oacute;n.</p>`;

  return getResend().emails.send({
    from: getFrom(),
    to: teacher.correo,
    subject: "Recibimos su solicitud de acumulacion",
    html: baseHtml("Solicitud de acumulacion recibida", body),
  });
}

export async function sendAccumulationNotificationToDirector(teacher: Teacher, req: AccumulationRequest) {
  const body = `
    <p style="color:#4b4b4a;font-size:14px">Nueva solicitud de acumulaci&oacute;n recibida.</p>
    <table style="border-collapse:collapse;width:100%;margin:16px 0">
      ${row("Docente", fullName(teacher))}
      ${row("C&eacute;dula", teacher.cedula)}
      ${row("Correo", teacher.correo)}
      ${row("Fecha acumulada", formatDate(req.fecha_acumulada))}
      ${row("Materia", req.materia)}
      ${row("Cantidad", `${req.cantidad_lecciones} lecci&oacute;n(es)`)}
      ${row("Horarios", req.lecciones.join(", "))}
      ${row("Observaciones", req.detalle || "—")}
    </table>`;

  return getResend().emails.send({
    from: getFrom(),
    to: getDirector(),
    subject: `Nueva acumulacion: ${fullName(teacher)}`,
    html: baseHtml(`Nueva acumulacion — ${fullName(teacher)}`, body),
  });
}

export async function sendUsageConfirmationToTeacher(teacher: Teacher, req: UsageRequest) {
  const body = `
    <p style="color:#4b4b4a;font-size:14px">Hola <strong>${fullName(teacher)}</strong>, recibimos su solicitud de rebajo.</p>
    <table style="border-collapse:collapse;width:100%;margin:16px 0">
      ${row("Estado", '<span style="background:#fff3cd;color:#856404;padding:2px 8px;border-radius:4px;font-size:12px">Pendiente de revisi&oacute;n</span>')}
      ${row("Fecha propuesta", formatDate(req.fecha_rebajo_propuesta))}
      ${row("Hora de salida", req.hora_salida)}
      ${row("Lecciones a usar", `${req.lecciones_a_usar} lecci&oacute;n(es)`)}
      ${row("Motivo", req.motivo)}
    </table>
    <p style="color:#4b4b4a;font-size:14px">La directora revisar&aacute; su solicitud y recibir&aacute; una notificaci&oacute;n con la decisi&oacute;n.</p>`;

  return getResend().emails.send({
    from: getFrom(),
    to: teacher.correo,
    subject: "Recibimos su solicitud de rebajo",
    html: baseHtml("Solicitud de rebajo recibida", body),
  });
}

export async function sendUsageNotificationToDirector(teacher: Teacher, req: UsageRequest) {
  const body = `
    <p style="color:#4b4b4a;font-size:14px">Nueva solicitud de rebajo recibida.</p>
    <table style="border-collapse:collapse;width:100%;margin:16px 0">
      ${row("Docente", fullName(teacher))}
      ${row("C&eacute;dula", teacher.cedula)}
      ${row("Correo", teacher.correo)}
      ${row("Fecha propuesta", formatDate(req.fecha_rebajo_propuesta))}
      ${row("Hora de salida", req.hora_salida)}
      ${row("Lecciones a usar", `${req.lecciones_a_usar} lecci&oacute;n(es)`)}
      ${row("Motivo", req.motivo)}
      ${req.detalle ? row("Detalle adicional", req.detalle) : ""}
    </table>`;

  return getResend().emails.send({
    from: getFrom(),
    to: getDirector(),
    subject: `Nuevo rebajo: ${fullName(teacher)}`,
    html: baseHtml(`Nuevo rebajo — ${fullName(teacher)}`, body),
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
    ? '<span style="background:#d1fae5;color:#065f46;padding:2px 8px;border-radius:4px;font-size:12px">Aprobada</span>'
    : '<span style="background:#fee2e2;color:#991b1b;padding:2px 8px;border-radius:4px;font-size:12px">Rechazada</span>';

  const body = `
    <p style="color:#4b4b4a;font-size:14px">Hola <strong>${fullName(teacher)}</strong>, su solicitud de ${type} ha sido procesada.</p>
    <table style="border-collapse:collapse;width:100%;margin:16px 0">
      ${row("Decisi&oacute;n", statusBadge)}
      ${row("Fecha de decisi&oacute;n", formatDateTime(fecha_decision))}
      ${comentario ? row("Comentario de la directora", comentario) : row("Comentario", "Sin comentario adicional.")}
    </table>`;

  const subject = approved ? `Su ${type} fue aprobada` : `Su ${type} fue rechazada`;

  return getResend().emails.send({
    from: getFrom(),
    to: teacher.correo,
    subject,
    html: baseHtml(`Su solicitud de ${type} fue ${estado}`, body),
  });
}
