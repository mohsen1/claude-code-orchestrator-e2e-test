import { initializeDatabase } from './src/lib/db';

// Example usage of User and Group models

function example() {
  // Initialize database
  const { user, group } = initializeDatabase('./expenses.db');

  // Create a user
  const newUser = user.create({
    email: 'john@example.com',
    password: 'securepassword123',
    name: 'John Doe',
    avatar_url: 'https://example.com/avatar.jpg'
  });

  console.log('Created user:', newUser);

  // Find user by email
  const foundUser = user.findByEmail('john@example.com');
  console.log('Found user:', foundUser);

  // Create a group
  const newGroup = group.create({
    name: 'Apartment Expenses',
    description: 'Shared expenses for roommates',
    created_by: newUser.id
  });

  console.log('Created group:', newGroup);

  // Add members to the group
  group.addMember(newGroup.id, newUser.id);

  // Get group members
  const members = group.getMembers(newGroup.id);
  console.log('Group members:', members);

  // Get user's groups
  const userGroups = group.getUserGroups(newUser.id);
  console.log('User groups:', userGroups);

  // Update user
  const updatedUser = user.update(newUser.id, {
    name: 'John Smith'
  });
  console.log('Updated user:', updatedUser);

  // Update group
  const updatedGroup = group.update(newGroup.id, {
    description: 'Monthly apartment expenses'
  });
  console.log('Updated group:', updatedGroup);

  // Get all users
  const allUsers = user.findAll();
  console.log('All users:', allUsers);

  // Get all groups
  const allGroups = group.findAll();
  console.log('All groups:', allGroups);
}
