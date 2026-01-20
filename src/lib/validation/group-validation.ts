/**
 * Validation schemas for group-related operations
 */

export interface CreateGroupSchema {
  name: string;
  description?: string;
  currency?: string;
}

export interface UpdateGroupSchema {
  name?: string;
  description?: string;
  currency?: string;
}

export interface GroupMemberSchema {
  userId: string;
  role?: 'admin' | 'member';
}

/**
 * Validate group creation data
 */
export function validateCreateGroup(data: unknown): CreateGroupSchema {
  const errors: Record<string, string[]> = {};

  if (!data || typeof data !== 'object') {
    throw new Error('Invalid request body');
  }

  const body = data as Record<string, unknown>;

  // Validate name
  if (!body.name || typeof body.name !== 'string') {
    errors.name = errors.name || [];
    errors.name.push('Name is required and must be a string');
  } else if (body.name.trim().length < 2) {
    errors.name = errors.name || [];
    errors.name.push('Name must be at least 2 characters long');
  } else if (body.name.trim().length > 100) {
    errors.name = errors.name || [];
    errors.name.push('Name must not exceed 100 characters');
  }

  // Validate description
  if (body.description !== undefined) {
    if (typeof body.description !== 'string') {
      errors.description = errors.description || [];
      errors.description.push('Description must be a string');
    } else if (body.description.length > 500) {
      errors.description = errors.description || [];
      errors.description.push('Description must not exceed 500 characters');
    }
  }

  // Validate currency
  if (body.currency !== undefined) {
    if (typeof body.currency !== 'string') {
      errors.currency = errors.currency || [];
      errors.currency.push('Currency must be a string');
    } else if (body.currency.length !== 3) {
      errors.currency = errors.currency || [];
      errors.currency.push('Currency must be a valid ISO 4217 code (3 letters)');
    }
  }

  if (Object.keys(errors).length > 0) {
    const error: any = new Error('Validation failed');
    error.fields = errors;
    throw error;
  }

  return {
    name: body.name.trim(),
    description: body.description?.trim() || undefined,
    currency: body.currency?.toUpperCase() || 'USD',
  };
}

/**
 * Validate group update data
 */
export function validateUpdateGroup(data: unknown): UpdateGroupSchema {
  const errors: Record<string, string[]> = {};

  if (!data || typeof data !== 'object') {
    throw new Error('Invalid request body');
  }

  const body = data as Record<string, unknown>;

  // At least one field must be provided
  if (Object.keys(body).length === 0) {
    throw new Error('At least one field must be provided for update');
  }

  // Validate name
  if (body.name !== undefined) {
    if (typeof body.name !== 'string') {
      errors.name = errors.name || [];
      errors.name.push('Name must be a string');
    } else if (body.name.trim().length < 2) {
      errors.name = errors.name || [];
      errors.name.push('Name must be at least 2 characters long');
    } else if (body.name.trim().length > 100) {
      errors.name = errors.name || [];
      errors.name.push('Name must not exceed 100 characters');
    }
  }

  // Validate description
  if (body.description !== undefined) {
    if (typeof body.description !== 'string') {
      errors.description = errors.description || [];
      errors.description.push('Description must be a string');
    } else if (body.description.length > 500) {
      errors.description = errors.description || [];
      errors.description.push('Description must not exceed 500 characters');
    }
  }

  // Validate currency
  if (body.currency !== undefined) {
    if (typeof body.currency !== 'string') {
      errors.currency = errors.currency || [];
      errors.currency.push('Currency must be a string');
    } else if (body.currency.length !== 3) {
      errors.currency = errors.currency || [];
      errors.currency.push('Currency must be a valid ISO 4217 code (3 letters)');
    }
  }

  if (Object.keys(errors).length > 0) {
    const error: any = new Error('Validation failed');
    error.fields = errors;
    throw error;
  }

  const result: UpdateGroupSchema = {};

  if (body.name !== undefined) {
    result.name = body.name.trim();
  }
  if (body.description !== undefined) {
    result.description = body.description.trim();
  }
  if (body.currency !== undefined) {
    result.currency = body.currency.toUpperCase();
  }

  return result;
}

/**
 * Validate group ID parameter
 */
export function validateGroupId(id: string): string {
  if (!id || typeof id !== 'string') {
    throw new Error('Invalid group ID');
  }

  // Check if it's a valid UUID format (basic check)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    throw new Error('Invalid group ID format');
  }

  return id;
}

/**
 * Validate query parameters for listing groups
 */
export interface ListGroupsQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export function validateListGroupsQuery(query: Record<string, string>): ListGroupsQuery {
  const result: ListGroupsQuery = {
    page: 1,
    limit: 20,
  };

  if (query.page) {
    const page = parseInt(query.page, 10);
    if (isNaN(page) || page < 1) {
      throw new Error('Invalid page parameter');
    }
    result.page = page;
  }

  if (query.limit) {
    const limit = parseInt(query.limit, 10);
    if (isNaN(limit) || limit < 1 || limit > 100) {
      throw new Error('Invalid limit parameter (must be between 1 and 100)');
    }
    result.limit = limit;
  }

  if (query.search) {
    const search = query.search.trim();
    if (search.length > 100) {
      throw new Error('Search query too long');
    }
    result.search = search;
  }

  return result;
}
