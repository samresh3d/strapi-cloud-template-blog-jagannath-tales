'use strict';

function uniqueById(list) {
  const seen = new Set();
  const out = [];
  for (const item of Array.isArray(list) ? list : []) {
    const id = typeof item === 'object' ? item?.id : item;
    if (id == null) continue;
    const type = typeof item === 'object' && item?.__type ? String(item.__type) : '';
    const key = `${id}${type ? `:${type}` : ''}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

function normalizeRelPayload(rel) {
  if (Array.isArray(rel)) {
    return uniqueById(rel);
  }
  if (rel && typeof rel === 'object') {
    const next = {};
    if ('set' in rel) next.set = uniqueById(rel.set);
    if (rel.connect) next.connect = uniqueById(rel.connect);
    if (rel.disconnect) next.disconnect = uniqueById(rel.disconnect);
    if (rel.options) next.options = rel.options;
    return next;
  }
  return rel;
}

async function maybeDropRelationsOnPublishDuringCreate(event) {
  const data = event?.params?.data || {};
  const documentId = data?.documentId;
  const isPublishing = data?.publishedAt != null;
  if (!documentId || !isPublishing) return;
  try {
    const existing = await strapi.db
      .query('api::pages-article.pages-article')
      .findMany({ where: { documentId } });
    if (Array.isArray(existing) && existing.length > 0) {
      if (data.quotes) delete data.quotes;
      if (data.festivalEvents) delete data.festivalEvents;
    }
  } catch (e) {
    if (data.quotes) data.quotes = normalizeRelPayload(data.quotes);
    if (data.festivalEvents) data.festivalEvents = normalizeRelPayload(data.festivalEvents);
  }
}

module.exports = {
  async beforeCreate(event) {
    await maybeDropRelationsOnPublishDuringCreate(event);
    const data = event?.params?.data || {};
    if (data.quotes) data.quotes = normalizeRelPayload(data.quotes);
    if (data.festivalEvents) data.festivalEvents = normalizeRelPayload(data.festivalEvents);
  },
  beforeUpdate(event) {
    const data = event?.params?.data || {};
    if (data.quotes) data.quotes = normalizeRelPayload(data.quotes);
    if (data.festivalEvents) data.festivalEvents = normalizeRelPayload(data.festivalEvents);
  },
};
