<?php echo Form::open(array()); ?>

	<?php if (isset($_GET['destination'])): ?>
		<?php echo Form::hidden('destination',$_GET['destination']); ?>
	<?php endif; ?>

	<?php if (isset($login_error)): ?>
		<div class="error"><?php echo $login_error; ?></div>
	<?php endif; ?>

	<div class="row">
		<label for="email">Email or Username:</label>
		<div class="input"><?php echo Form::input('email', Input::post('email')); ?></div>
		
		<?php if ($val->errors('email')): ?>
			<div class="error"><?php echo $val->errors('email')->get_message('You must provide a username or email'); ?></div>
		<?php endif; ?>
	</div>

	<div class="row">
		<label for="password">Password:</label>
		<div class="input"><?php echo Form::password('password'); ?></div>
		
		<?php if ($val->errors('password')): ?>
			<div class="error"><?php echo $val->errors('password')->get_message(':label cannot be blank'); ?></div>
		<?php endif; ?>
	</div>

	<div class="actions">
		<?php echo Form::submit(array('value'=>'Login', 'name'=>'submit')); ?>
	</div>

	<div class="link">
		<?php echo Html::anchor('member/signup', '新規登録'); ?>
	</div>

<?php echo Form::close(); ?>